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

const PAYMENT_METHODS = ['CREDIT_CARD', 'BANK_TRANSFER'];
const ORDER_STATUSES = ['CREATED', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

const orderView = (o: any) => decimalFields(o, ['unit_price', 'total_amount']);

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** GET /orders/mine — alıcı veya satıcı olarak taraf olduğum tüm siparişler */
  @Get('mine')
  async mine(@Req() req: any) {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { buyer_org_id: req.user.organization_id },
          { seller_org_id: req.user.organization_id },
        ],
      },
      include: { product: { select: { id: true, title: true } } },
      orderBy: { created_at: 'desc' },
    });
    return orders.map(orderView);
  }

  /**
   * POST /orders — { product_id, quantity, unit_price?, payment_method }
   * unit_price verilmezse ürünün güncel fiyatı kullanılır (kabul edilmiş bir tekliften
   * gelen anlaşılan fiyat elle girilebilir). Satın alma yalnızca Premium alıcılara açık.
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

    const quantityKg = Number(body.quantity_kg);
    if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
      throw new BadRequestException('Geçerli bir miktar (kg) girin');
    }

    const product = await this.prisma.product.findUnique({ where: { id: body.product_id } });
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Ürün bulunamadı veya artık aktif değil');
    }
    if (quantityKg > product.quantity_kg) {
      throw new BadRequestException('Talep edilen miktar mevcut stoktan fazla');
    }

    const unitPrice = body.unit_price !== undefined ? Number(body.unit_price) : Number(product.price_per_kg);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new BadRequestException('Geçerli bir kg fiyatı girin');
    }

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
