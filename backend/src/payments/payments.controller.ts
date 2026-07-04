import { Controller, Post, Param, Req, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * MVP'de gerçek bir ödeme sağlayıcısı (iyzico/PayTR/Stripe) entegre değil.
 * Kredi kartı akışı PCI-DSS kapsamına girmemek için sağlayıcının hosted
 * checkout/tokenization akışıyla Faz 2'de eklenmelidir — bkz. teknik brief §7.
 * Şimdilik yalnızca banka havalesi bildirimi desteklenir.
 */
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** POST /payments/bank-transfer/:orderId/notify — alıcı "havale yaptım" der, satıcı+admin bilgilendirilir */
  @Post('bank-transfer/:orderId/notify')
  async notifyBankTransfer(@Req() req: any, @Param('orderId') orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı');
    if (order.buyer_org_id !== req.user.organization_id) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    await this.notifications.send(order.seller_org_id, 'EMAIL', 'ORDER_CONFIRM', {
      order_id: order.id,
      message: 'Alıcı banka havalesi yaptığını bildirdi — dekontu kontrol edip ödemeyi onaylayın',
    });

    return { notified: true };
  }
}
