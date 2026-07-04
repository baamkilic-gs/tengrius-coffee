import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/**
 * MVP: gerçek sağlayıcı entegrasyonu yok (Email: Resend/SendGrid, SMS: NetGSM, Push).
 * Her bildirim NotificationLog'a yazılır ve konsola basılır — Faz 2'de
 * burası sağlayıcı çağrılarıyla değiştirilir, çağıran kod değişmez.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async send(
    organizationId: string,
    channel: 'EMAIL' | 'SMS' | 'PUSH',
    eventType: 'PRICE_ALERT' | 'ORDER_CONFIRM' | 'OFFER_UPDATE',
    payload: Record<string, any>,
  ) {
    this.logger.log(`[${channel}] ${eventType} → org:${organizationId} ${JSON.stringify(payload)}`);
    return this.prisma.notificationLog.create({
      data: { organization_id: organizationId, channel, event_type: eventType, payload },
    });
  }
}
