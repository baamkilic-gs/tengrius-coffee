import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Req,
  Body,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const ORG_TYPES = ['SELLER', 'ROASTER'];

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
  tax_number: o.tax_number,
  tax_office: o.tax_office,
  company_legal_name: o.company_legal_name,
  website: o.website,
  bank_iban_try: o.bank_iban_try,
  bank_iban_usd: o.bank_iban_usd,
  includes_vat: o.includes_vat,
  nationwide_shipping: o.nationwide_shipping,
  same_day_shipping: o.same_day_shipping,
  shipping_address: o.shipping_address,
  ship_to_billing: o.ship_to_billing,
  shipping_contact_name: o.shipping_contact_name,
  shipping_contact_phone: o.shipping_contact_phone,
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
        throw new BadRequestException('Tip SELLER veya ROASTER olmalıdır');
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

  /** GET /organizations — tüm satıcı organizasyonları listeler (yalnız admin) — "Yetkili Satıcı" rozeti yönetimi için */
  @Get()
  async listSellers(@Req() req: any) {
    if (req.user.system_role !== 'ADMIN') {
      throw new ForbiddenException('Bu listeyi yalnızca admin görebilir');
    }
    const orgs = await this.prisma.organization.findMany({
      where: { type: 'SELLER' },
      orderBy: { created_at: 'desc' },
    });
    return orgs.map(orgView);
  }

  /** PATCH /organizations/:id/verify — { verified } — "Yetkili Satıcı" rozetini admin verir/kaldırır */
  @Patch(':id/verify')
  async setVerified(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.system_role !== 'ADMIN') {
      throw new ForbiddenException('Bu işlemi yalnızca admin yapabilir');
    }
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organizasyon bulunamadı');

    const updated = await this.prisma.organization.update({
      where: { id },
      data: { verified: Boolean(body.verified) },
    });
    return orgView(updated);
  }
}
