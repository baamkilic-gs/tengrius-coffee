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
const MEMBERSHIP_TIERS = ['STANDARD', 'BASIC', 'PREMIUM'];

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
   * POST /organizations/membership-requests — Basic/Premium talebi oluşturur (MVP: ödeme
   * sağlayıcısı yok). Talep PENDING olarak admin'in onayını bekler; admin onaylarsa
   * tier gerçekten uygulanır (30 gün), reddederse hiçbir şey değişmez.
   */
  @Post('membership-requests')
  async createMembershipRequest(@Req() req: any, @Body() body: any) {
    const tier = String(body?.tier ?? '').toUpperCase();
    if (tier !== 'BASIC' && tier !== 'PREMIUM') {
      throw new BadRequestException('tier BASIC veya PREMIUM olmalıdır');
    }
    const pending = await this.prisma.membershipRequest.findFirst({
      where: { organization_id: req.user.organization_id, status: 'PENDING' },
    });
    if (pending) {
      throw new BadRequestException('Zaten onay bekleyen bir üyelik talebiniz var');
    }
    return this.prisma.membershipRequest.create({
      data: { organization_id: req.user.organization_id, requested_tier: tier as any },
    });
  }

  /** GET /organizations/membership-requests/mine — organizasyonumun talep geçmişi (en yeni önce) */
  @Get('membership-requests/mine')
  async myMembershipRequests(@Req() req: any) {
    return this.prisma.membershipRequest.findMany({
      where: { organization_id: req.user.organization_id },
      orderBy: { created_at: 'desc' },
    });
  }

  /** GET /organizations/membership-requests — tüm talepleri listeler (yalnız admin) */
  @Get('membership-requests')
  async listMembershipRequests(@Req() req: any) {
    if (req.user.system_role !== 'ADMIN') {
      throw new ForbiddenException('Bu listeyi yalnızca admin görebilir');
    }
    const requests = await this.prisma.membershipRequest.findMany({
      orderBy: { created_at: 'desc' },
      include: { organization: { select: { id: true, name: true, type: true, membership_tier: true } } },
    });
    return requests;
  }

  /** PATCH /organizations/membership-requests/:id — { decision: 'APPROVED'|'REJECTED' } (yalnız admin) */
  @Patch('membership-requests/:id')
  async decideMembershipRequest(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.system_role !== 'ADMIN') {
      throw new ForbiddenException('Bu işlemi yalnızca admin yapabilir');
    }
    const decision = String(body?.decision ?? '').toUpperCase();
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      throw new BadRequestException('decision APPROVED veya REJECTED olmalıdır');
    }
    const request = await this.prisma.membershipRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Talep bulunamadı');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Bu talep zaten karara bağlanmış');
    }

    if (decision === 'APPROVED') {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      await this.prisma.organization.update({
        where: { id: request.organization_id },
        data: { membership_tier: request.requested_tier, membership_expires_at: expires },
      });
    }

    return this.prisma.membershipRequest.update({
      where: { id },
      data: { status: decision as any, decided_at: new Date() },
    });
  }

  /**
   * GET /organizations — tüm organizasyonları listeler (yalnız admin) — "Yetkili Satıcı"
   * rozeti ve üyelik seviyesi yönetimi için (hem SELLER hem ROASTER premium olabilir).
   */
  @Get()
  async listOrganizations(@Req() req: any) {
    if (req.user.system_role !== 'ADMIN') {
      throw new ForbiddenException('Bu listeyi yalnızca admin görebilir');
    }
    const orgs = await this.prisma.organization.findMany({
      orderBy: { created_at: 'desc' },
    });
    return orgs.map(orgView);
  }

  /** PATCH /organizations/:id/membership — { tier, expires_at? } — admin üyelik seviyesini elle yönetir */
  @Patch(':id/membership')
  async setMembership(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.system_role !== 'ADMIN') {
      throw new ForbiddenException('Bu işlemi yalnızca admin yapabilir');
    }
    const tier = String(body?.tier ?? '').toUpperCase();
    if (!MEMBERSHIP_TIERS.includes(tier)) {
      throw new BadRequestException('tier STANDARD, BASIC veya PREMIUM olmalıdır');
    }
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organizasyon bulunamadı');

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        membership_tier: tier as any,
        membership_expires_at: tier === 'STANDARD' ? null : (body?.expires_at ? new Date(body.expires_at) : org.membership_expires_at),
      },
    });
    return orgView(updated);
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
