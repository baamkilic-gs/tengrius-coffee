import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  Req,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { decimalFields } from '../common/serialize';

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
