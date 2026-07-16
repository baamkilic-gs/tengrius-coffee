import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
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

const PAYMENT_METHODS = ['CREDIT_CARD', 'BANK_TRANSFER'];
const ORDER_STATUSES = ['CREATED', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

// Sipariş ekranında karşı tarafın firma bilgileri — banka IBAN'ları havale ödemesi için gereklidir
const ORG_CONTACT_SELECT = {
  id: true,
  name: true,
  company_legal_name: true,
  tax_number: true,
  tax_office: true,
  website: true,
  country: true,
  verified: true,
  bank_iban_try: true,
  bank_iban_usd: true,
  shipping_address: true,
};

const orderView = (o: any) => decimalFields(o, ['unit_price', 'total_amount']);

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** GET /orders/mine — alıcı veya satıcı olarak taraf olduğum tüm siparişler; karşı tarafın firma bilgileri dahil */
  @Get('mine')
  async mine(@Req() req: any) {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { buyer_org_id: req.user.organization_id },
          { seller_org_id: req.user.organization_id },
        ],
      },
      include: {
        product: { select: { id: true, title: true } },
        buyer: { select: ORG_CONTACT_SELECT },
        seller: { select: ORG_CONTACT_SELECT },
      },
      orderBy: { created_at: 'desc' },
    });
    return orders.map(orderView);
  }

  /**
   * GET /orders/stats?from=&to= — panel "Genel Bakış" için toplam adet/miktar/ciro.
   * Satıcı organizasyonlar için satış tarafı, Roaster'lar için alım tarafı hesaplanır.
   */
  @Get('stats')
  async stats(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    const isSeller = req.user.org_type === 'SELLER';
    const where: any = isSeller
      ? { seller_org_id: req.user.organization_id }
      : { buyer_org_id: req.user.organization_id };
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(from);
      if (to) where.created_at.lte = new Date(to);
    }

    const orders = await this.prisma.order.findMany({ where, select: { quantity_kg: true, total_amount: true } });
    const totalQuantityKg = orders.reduce((sum, o) => sum + o.quantity_kg, 0);
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    return {
      role: isSeller ? 'SELLER' : 'ROASTER',
      order_count: orders.length,
      total_quantity_kg: totalQuantityKg,
      total_quantity_tons: Math.round((totalQuantityKg / 1000) * 1000) / 1000,
      total_revenue: Math.round(totalRevenue * 100) / 100,
    };
  }

  /**
   * POST /orders — { offer_id, payment_method } — kabul edilmiş bir teklifin fiyat/miktarını
   * aynen kullanarak sipariş oluşturur (her sipariş bir teklif üzerinden geçer, doğrudan/
   * tekliften bağımsız satın alma kaldırıldı). Yalnızca Premium alıcılara açık.
   */
  @UseGuards(PremiumGuard)
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const paymentMethod = String(body.payment_method ?? '').toUpperCase();
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      throw new BadRequestException('payment_method CREDIT_CARD veya BANK_TRANSFER olmalıdır');
    }
    if (paymentMethod === 'CREDIT_CARD') {
      throw new BadRequestException(
        'Kredi kartı ödemesi henüz aktif değil — bir ödeme sağlayıcısı entegrasyonu gerekir. Şimdilik BANK_TRANSFER kullanın.',
      );
    }
    if (!body.offer_id) {
      throw new BadRequestException('Sipariş yalnızca kabul edilmiş bir teklif üzerinden oluşturulabilir');
    }

    const offer = await this.prisma.offer.findUnique({ where: { id: body.offer_id }, include: { product: true } });
    if (!offer || offer.buyer_org_id !== req.user.organization_id) {
      throw new NotFoundException('Teklif bulunamadı');
    }
    if (offer.status !== 'ACCEPTED') {
      throw new BadRequestException('Yalnızca kabul edilmiş bir tekliften sipariş oluşturulabilir');
    }
    if (offer.order_id) {
      throw new BadRequestException('Bu teklif zaten bir siparişe dönüştürülmüş');
    }

    const quantityKg = Number(offer.quantity_kg);
    const product = offer.product;
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Ürün bulunamadı veya artık aktif değil');
    }
    if (quantityKg > product.quantity_kg) {
      throw new BadRequestException('Talep edilen miktar mevcut stoktan fazla');
    }

    const unitPrice = Number(offer.offer_price);

    const order = await this.prisma.order.create({
      data: {
        product_id: product.id,
        buyer_org_id: req.user.organization_id,
        seller_org_id: product.seller_org_id,
        quantity_kg: quantityKg,
        unit_price: unitPrice,
        total_amount: unitPrice * quantityKg,
        currency: product.currency,
        payment_method: paymentMethod as any,
      },
    });

    await this.prisma.offer.update({ where: { id: offer.id }, data: { order_id: order.id } });

    await this.notifications.send(product.seller_org_id, 'EMAIL', 'ORDER_CONFIRM', {
      order_id: order.id,
      product_id: product.id,
    });

    return orderView(order);
  }

  /**
   * PATCH /orders/:id/payment-status — { payment_status }
   * Havale bildirimi sonrası satıcı (veya admin) dekontu kontrol edip PAID'e çeker.
   */
  @Patch(':id/payment-status')
  async setPaymentStatus(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    if (order.seller_org_id !== req.user.organization_id && req.user.system_role !== 'ADMIN') {
      throw new ForbiddenException('Bu siparişin ödeme durumunu yalnızca satıcı veya admin değiştirebilir');
    }

    const status = String(body.payment_status ?? '').toUpperCase();
    if (!['PENDING', 'PAID', 'FAILED', 'REFUNDED'].includes(status)) {
      throw new BadRequestException('Geçersiz ödeme durumu');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { payment_status: status as any },
    });

    if (status === 'PAID') {
      await this.notifications.send(order.buyer_org_id, 'EMAIL', 'ORDER_CONFIRM', {
        order_id: order.id,
        payment_status: status,
      });
    }

    return orderView(updated);
  }

  /** PATCH /orders/:id/status — { order_status } (yalnız satıcı) */
  @Patch(':id/status')
  async setStatus(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    if (order.seller_org_id !== req.user.organization_id) {
      throw new ForbiddenException('Bu siparişin durumunu yalnızca satıcı değiştirebilir');
    }

    const status = String(body.order_status ?? '').toUpperCase();
    if (!ORDER_STATUSES.includes(status)) {
      throw new BadRequestException('Geçersiz sipariş durumu');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { order_status: status as any },
    });
    return orderView(updated);
  }
}
