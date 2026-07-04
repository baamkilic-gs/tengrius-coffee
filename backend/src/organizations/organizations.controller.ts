import {
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const ORG_TYPES = ['BUYER', 'SELLER', 'BOTH'];

const orgView = (o: any) => ({
  id: o.id,
  name: o.name,
  type: o.type,
  country: o.country,
  membership_tier: o.membership_tier,
  membership_expires_at: o.membership_expires_at,
  trust_score: o.trust_score,
  verified: o.verified,
  created_at: o.created_at,
});

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly prisma: PrismaService) {}

  /** GET /organizations/me — oturumdaki organizasyonun bilgisi */
  @Get('me')
  async me(@Req() req: any) {
    const org = await this.prisma.organization.findUnique({
      where: { id: req.user.organization_id },
    });
    if (!org) throw new NotFoundException('Organizasyon bulunamadı');
    return orgView(org);
  }

  /** PATCH /organizations/me — ad/tip/ülke güncelleme */
  @Patch('me')
  async update(@Req() req: any, @Body() body: any) {
    const data: any = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) throw new BadRequestException('Ad boş olamaz');
      data.name = name;
    }
    if (body.type !== undefined) {
      const type = String(body.type).toUpperCase();
      if (!ORG_TYPES.includes(type)) {
        throw new BadRequestException('Tip BUYER, SELLER veya BOTH olmalıdır');
      }
      data.type = type;
    }
    if (body.country !== undefined) {
      data.country = body.country ? String(body.country).trim() : null;
    }

    const updated = await this.prisma.organization.update({
      where: { id: req.user.organization_id },
      data,
    });
    return orgView(updated);
  }

  /**
   * POST /organizations/upgrade — Standart → Premium (MVP: ödeme sağlayıcısı yok,
   * havale/manuel onay akışının basitleştirilmiş hali). 30 gün geçerli.
   * NOT: Gerçek ödeme entegrasyonu (iyzico/PayTR/Stripe) Faz 2 — bkz. payments modülü.
   */
  @Post('upgrade')
  async upgrade(@Req() req: any) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    const updated = await this.prisma.organization.update({
      where: { id: req.user.organization_id },
      data: { membership_tier: 'PREMIUM', membership_expires_at: expires },
    });
    return orgView(updated);
  }
}
