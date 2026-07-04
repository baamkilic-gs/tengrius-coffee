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
      include: { product: { select: { id: true, title: true, seller_org_id: true } } },
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
      },
      orderBy: { created_at: 'desc' },
    });
    return offers.map(offerView);
  }

  /** POST /offers — { product_id, offer_price, quantity, message? } (yalnız Premium alıcı) */
  @UseGuards(PremiumGuard)
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (!['BUYER', 'BOTH'].includes(req.user.org_type)) {
      throw new ForbiddenException('Teklif verme yalnızca alıcı organizasyonlarına açıktır');
    }

    const offerPrice = Number(body.offer_price);
    const quantity = Number(body.quantity);
    if (!Number.isFinite(offerPrice) || offerPrice <= 0) {
      throw new BadRequestException('Geçerli bir teklif fiyatı girin');
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Geçerli bir miktar girin');
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
        quantity,
        message: body.message ?? null,
      },
    });

    await this.notifications.send(product.seller_org_id, 'EMAIL', 'OFFER_UPDATE', {
      offer_id: offer.id,
      product_id: product.id,
      status: 'PENDING',
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

  private async resolve(req: any, id: string, status: 'ACCEPTED' | 'REJECTED') {
    const offer = await this.prisma.offer.findUnique({ where: { id }, include: { product: true } });
    if (!offer) throw new NotFoundException('Teklif bulunamadı');
    if (offer.product.seller_org_id !== req.user.organization_id) {
      throw new ForbiddenException('Bu teklif size ait bir ürüne değil');
    }
    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Bu teklif zaten sonuçlandırılmış');
    }

    const updated = await this.prisma.offer.update({ where: { id }, data: { status } });

    await this.notifications.send(offer.buyer_org_id, 'EMAIL', 'OFFER_UPDATE', {
      offer_id: offer.id,
      product_id: offer.product_id,
      status,
    });

    return offerView(updated);
  }
}
