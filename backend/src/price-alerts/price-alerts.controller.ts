import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PremiumGuard } from '../common/premium.guard';
import { decimalFields } from '../common/serialize';

const DIRECTIONS = ['BELOW', 'ABOVE'];

const alertView = (a: any) => decimalFields(a, ['target_price']);

@Controller('price-alerts')
export class PriceAlertsController {
  constructor(private readonly prisma: PrismaService) {}

  /** GET /price-alerts/mine — organizasyonun kurduğu tüm alarmlar */
  @Get('mine')
  async mine(@Req() req: any) {
    const alerts = await this.prisma.priceAlert.findMany({
      where: { organization_id: req.user.organization_id },
      orderBy: { id: 'desc' },
    });
    return alerts.map(alertView);
  }

  /** POST /price-alerts — { product_id?, bean_type?, country?, target_price, direction, channel_email?, channel_sms?, channel_push? } */
  @UseGuards(PremiumGuard)
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    const direction = String(body.direction ?? '').toUpperCase();
    if (!DIRECTIONS.includes(direction)) {
      throw new BadRequestException('direction BELOW veya ABOVE olmalıdır');
    }
    const targetPrice = Number(body.target_price);
    if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
      throw new BadRequestException('Geçerli bir hedef fiyat girin');
    }
    if (!body.product_id && !(body.bean_type && body.country)) {
      throw new BadRequestException('product_id veya (bean_type + country) belirtilmelidir');
    }

    const alert = await this.prisma.priceAlert.create({
      data: {
        organization_id: req.user.organization_id,
        product_id: body.product_id ?? null,
        bean_type: body.bean_type ?? null,
        country: body.country ?? null,
        target_price: targetPrice,
        direction: direction as any,
        channel_email: body.channel_email ?? true,
        channel_sms: body.channel_sms ?? false,
        channel_push: body.channel_push ?? true,
      },
    });
    return alertView(alert);
  }

  /** DELETE /price-alerts/:id — alarmı kaldır (yalnız kendi organizasyonun) */
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const existing = await this.prisma.priceAlert.findFirst({
      where: { id, organization_id: req.user.organization_id },
    });
    if (!existing) throw new NotFoundException('Alarm bulunamadı');

    await this.prisma.priceAlert.delete({ where: { id } });
    return { deleted: true };
  }
}
