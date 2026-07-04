import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PriceAlertsService {
  private readonly logger = new Logger(PriceAlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Bir ürünün fiyatı değiştiğinde çağrılır — o ürüne veya ürünün ülke+türüne bağlı alarmları kontrol eder. */
  async checkForProduct(productId: string, currentPrice: number, country: string, beanType: string) {
    const alerts = await this.prisma.priceAlert.findMany({
      where: {
        is_active: true,
        OR: [
          { product_id: productId },
          { product_id: null, country, bean_type: beanType },
        ],
      },
    });
    for (const alert of alerts) {
      await this.evaluate(alert, currentPrice);
    }
  }

  /** Periyodik kontrol (15 dakikada bir) — ürüne bağlı olmayan genel alarmlar dahil tüm aktif alarmları tarar. */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async runPeriodicCheck() {
    const alerts = await this.prisma.priceAlert.findMany({ where: { is_active: true } });
    if (!alerts.length) return;
    this.logger.log(`Periyodik fiyat alarmı taraması: ${alerts.length} aktif alarm`);

    for (const alert of alerts) {
      const price = await this.currentPriceFor(alert);
      if (price === null) continue;
      await this.evaluate(alert, price);
    }
  }

  private async currentPriceFor(alert: {
    product_id: string | null;
    country: string | null;
    bean_type: string | null;
  }): Promise<number | null> {
    if (alert.product_id) {
      const product = await this.prisma.product.findUnique({ where: { id: alert.product_id } });
      return product ? Number(product.price_per_unit) : null;
    }
    const product = await this.prisma.product.findFirst({
      where: { status: 'ACTIVE', country: alert.country ?? undefined, bean_type: alert.bean_type ?? undefined },
      orderBy: { created_at: 'desc' },
    });
    return product ? Number(product.price_per_unit) : null;
  }

  private async evaluate(
    alert: { id: string; organization_id: string; target_price: any; direction: string; channel_email: boolean; channel_sms: boolean; channel_push: boolean },
    currentPrice: number,
  ) {
    const target = Number(alert.target_price);
    const triggered =
      (alert.direction === 'BELOW' && currentPrice <= target) ||
      (alert.direction === 'ABOVE' && currentPrice >= target);

    if (!triggered) return;

    await this.prisma.priceAlert.update({
      where: { id: alert.id },
      data: { is_active: false, triggered_at: new Date() },
    });

    const payload = { alert_id: alert.id, current_price: currentPrice, target_price: target };
    if (alert.channel_email) await this.notifications.send(alert.organization_id, 'EMAIL', 'PRICE_ALERT', payload);
    if (alert.channel_sms) await this.notifications.send(alert.organization_id, 'SMS', 'PRICE_ALERT', payload);
    if (alert.channel_push) await this.notifications.send(alert.organization_id, 'PUSH', 'PRICE_ALERT', payload);
  }
}
