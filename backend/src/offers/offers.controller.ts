import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PremiumGuard } from '../common/premium.guard';
import { NotificationsService } from '../notifications/notifications.service';
import { decimalFields } from '../common/serialize';

const offerView = (o: any) => decimalFields(o, ['offer_price']);

@Controller('offers')
export class OffersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** GET /offers/sent — organizasyonumun alıcı olarak verdiği teklifler */
  @Get('sent')
  async sent(@Req() req: any) {
    const offers = await this.prisma.offer.findMany({
      where: { buyer_org_id: req.user.organization_id },
      include: {
        product: { select: { id: true, title: true, seller_org_id: true } },
        order: { select: { id: true, order_no: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return offers.map(offerView);
  }

  /** GET /offers/received — organizasyonuma ait ürünlere gelen teklifler (satıcı görünümü) */
  @Get('received')
  async received(@Req() req: any) {
    const offers = await this.prisma.offer.findMany({
      where: { product: { seller_org_id: req.user.organization_id } },
      include: {
        product: { select: { id: true, title: true } },
        buyer: { select: { id: true, name: true, verified: true } },
        order: { select: { id: true, order_no: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    return offers.map(offerView);
  }

  /** POST /offers — { product_id, offer_price, quantity, message? } (yalnız Premium alıcı) */
  @UseGuards(PremiumGuard)
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (req.user.org_type !== 'ROASTER') {
      throw new ForbiddenException('Teklif verme yalnızca alıcı (Roaster) organizasyonlarına açıktır');
    }

    const offerPrice = Number(body.offer_price);
    const quantityKg = Number(body.quantity_kg);
    if (!Number.isFinite(offerPrice) || offerPrice <= 0) {
      throw new BadRequestException('Geçerli bir teklif fiyatı girin (kg başına)');
    }
    if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
      throw new BadRequestException('Geçerli bir miktar (kg) girin');
    }

    const product = await this.prisma.product.findUnique({ where: { id: body.product_id } });
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Ürün bulunamadı veya artık aktif değil');
    }
    if (product.seller_org_id === req.user.organization_id) {
      throw new BadRequestException('Kendi ürününüze teklif veremezsiniz');
    }

    const offer = await this.prisma.offer.create({
      data: {
        product_id: product.id,
        buyer_org_id: req.user.organization_id,
        offer_price: offerPrice,
        quantity_kg: quantityKg,
        message: body.message ?? null,
      },
    });

    await this.notifications.send(product.seller_org_id, 'EMAIL', 'OFFER_UPDATE', {
      offer_id: offer.id,
      product_id: product.id,
      status: 'PENDING',
    });
    await this.notifications.send(req.user.organization_id, 'EMAIL', 'OFFER_UPDATE', {
      offer_id: offer.id,
      product_id: product.id,
      status: 'SENT',
    });

    return offerView(offer);
  }

  /** PATCH /offers/:id/accept — satıcı kabul eder (yalnız ürün sahibi) */
  @Patch(':id/accept')
  async accept(@Req() req: any, @Param('id') id: string) {
    return this.resolve(req, id, 'ACCEPTED');
  }

  /** PATCH /offers/:id/reject — satıcı reddeder (yalnız ürün sahibi) */
  @Patch(':id/reject')
  async reject(@Req() req: any, @Param('id') id: string) {
    return this.resolve(req, id, 'REJECTED');
  }

  /**
   * Teklif kabul edilince süreç orada bitmez — sipariş otomatik oluşturulur
   * (satıcı için tek bir ödeme yöntemi (BANK_TRANSFER) olduğundan aradaki
   * manuel "sipariş oluştur" adımı gerçek bir karar taşımıyordu, sadece
   * sürtünme yaratıyordu). Alıcı havaleyi yaptığında Siparişlerim'den
   * bildirir, satıcı da dekontu görünce ödemeyi onaylar.
   */
  private async resolve(req: any, id: string, status: 'ACCEPTED' | 'REJECTED') {
    const offer = await this.prisma.offer.findUnique({ where: { id }, include: { product: true } });
    if (!offer) throw new NotFoundException('Teklif bulunamadı');
    if (offer.product.seller_org_id !== req.user.organization_id) {
      throw new ForbiddenException('Bu teklif size ait bir ürüne değil');
    }
    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Bu teklif zaten sonuçlandırılmış');
    }

    const product = offer.product;
    const quantityKg = Number(offer.quantity_kg);
    if (status === 'ACCEPTED' && quantityKg > product.quantity_kg) {
      throw new BadRequestException('Talep edilen miktar mevcut stoktan fazla — teklifi kabul edemezsiniz');
    }

    let updated: any = await this.prisma.offer.update({ where: { id }, data: { status } });

    if (status === 'ACCEPTED') {
      const unitPrice = Number(offer.offer_price);
      const order = await this.prisma.order.create({
        data: {
          product_id: product.id,
          buyer_org_id: offer.buyer_org_id,
          seller_org_id: product.seller_org_id,
          quantity_kg: quantityKg,
          unit_price: unitPrice,
          total_amount: unitPrice * quantityKg,
          currency: product.currency,
          payment_method: 'BANK_TRANSFER',
        },
      });
      updated = await this.prisma.offer.update({
        where: { id },
        data: { order_id: order.id },
        include: { order: { select: { id: true, order_no: true } } },
      });

      await this.notifications.send(product.seller_org_id, 'EMAIL', 'ORDER_CONFIRM', {
        order_id: order.id,
        product_id: product.id,
      });
      await this.notifications.send(offer.buyer_org_id, 'EMAIL', 'ORDER_CONFIRM', {
        order_id: order.id,
        product_id: product.id,
      });
    }

    await this.notifications.send(offer.buyer_org_id, 'EMAIL', 'OFFER_UPDATE', {
      offer_id: offer.id,
      product_id: offer.product_id,
      status,
    });

    return offerView(updated);
  }
}
