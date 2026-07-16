import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import * as bcrypt from 'bcryptjs';
import { Public } from './public.decorator';
import { PrismaService } from '../prisma.service';

const ORG_TYPES = ['SELLER', 'ROASTER'];

// Yanıtlara şifre hash'i asla dahil edilmez
const userView = (u: any) => ({
  id: u.id,
  email: u.email,
  phone: u.phone,
  full_name: u.full_name,
  role: u.role,
  mfa_enabled: u.mfa_enabled,
  created_at: u.created_at,
});

const orgView = (o: any) => ({
  id: o.id,
  name: o.name,
  type: o.type,
  country: o.country,
  membership_tier: o.membership_tier,
  membership_expires_at: o.membership_expires_at,
  verified: o.verified,
  company_legal_name: o.company_legal_name,
  website: o.website,
  includes_vat: o.includes_vat,
  nationwide_shipping: o.nationwide_shipping,
  same_day_shipping: o.same_day_shipping,
});

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * POST /auth/register — kullanıcı + organizasyon (OWNER olarak) oluşturur, oturum açar.
   * Ortak: email, password, full_name, phone, organization_name, organization_type (SELLER|ROASTER),
   *   country, kvkk_accepted, security_policy_accepted, sales_agreement_accepted (üçü de zorunlu).
   * SELLER ek zorunlu alanlar: tax_number, tax_office, company_legal_name, website.
   *   Opsiyonel: bank_iban_try, bank_iban_usd, includes_vat, nationwide_shipping, same_day_shipping.
   * ROASTER ek alanlar: shipping_address + ship_to_billing; false ise shipping_contact_name/phone zorunlu.
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Public()
  @Post('register')
  async register(@Body() body: any) {
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const fullName = String(body.full_name ?? '').trim();
    const phone = body.phone ? String(body.phone).trim() : null;
    const orgName = String(body.organization_name ?? '').trim();
    const orgType = String(body.organization_type ?? '').toUpperCase();
    const country = body.country ? String(body.country).trim() : null;

    if (!email || !email.includes('@')) {
      throw new BadRequestException('Geçerli bir e-posta girin');
    }
    if (password.length < 6) {
      throw new BadRequestException('Şifre en az 6 karakter olmalıdır');
    }
    if (!fullName) {
      throw new BadRequestException('Ad soyad zorunludur');
    }
    if (!orgName) {
      throw new BadRequestException('Firma adı zorunludur');
    }
    if (!ORG_TYPES.includes(orgType)) {
      throw new BadRequestException('Organizasyon tipi SELLER veya ROASTER olmalıdır');
    }
    if (!body.kvkk_accepted || !body.security_policy_accepted || !body.sales_agreement_accepted) {
      throw new BadRequestException(
        'KVKK Aydınlatma Metni, Bilgi Güvenliği Politikası ve Satış Sözleşmesi onayı zorunludur',
      );
    }

    const orgData: any = { name: orgName, type: orgType as any, country };
    const now = new Date();
    orgData.kvkk_accepted_at = now;
    orgData.security_policy_accepted_at = now;
    orgData.sales_agreement_accepted_at = now;

    if (orgType === 'SELLER') {
      const taxNumber = String(body.tax_number ?? '').trim();
      const taxOffice = String(body.tax_office ?? '').trim();
      const companyLegalName = String(body.company_legal_name ?? '').trim();
      const website = String(body.website ?? '').trim();
      if (!taxNumber || !taxOffice) {
        throw new BadRequestException('Vergi numarası ve vergi dairesi zorunludur');
      }
      if (!companyLegalName) {
        throw new BadRequestException('Şirket adı zorunludur');
      }
      if (!website) {
        throw new BadRequestException('Website zorunludur');
      }
      orgData.tax_number = taxNumber;
      orgData.tax_office = taxOffice;
      orgData.company_legal_name = companyLegalName;
      orgData.website = website;
      orgData.bank_iban_try = body.bank_iban_try ? String(body.bank_iban_try).trim() : null;
      orgData.bank_iban_usd = body.bank_iban_usd ? String(body.bank_iban_usd).trim() : null;
      orgData.includes_vat = Boolean(body.includes_vat);
      orgData.nationwide_shipping = Boolean(body.nationwide_shipping);
      orgData.same_day_shipping = Boolean(body.same_day_shipping);
    } else {
      orgData.tax_number = body.tax_number ? String(body.tax_number).trim() : null;
      orgData.tax_office = body.tax_office ? String(body.tax_office).trim() : null;
      orgData.website = body.website ? String(body.website).trim() : null;
      orgData.shipping_address = body.shipping_address ? String(body.shipping_address).trim() : null;
      const shipToBilling = body.ship_to_billing !== false;
      orgData.ship_to_billing = shipToBilling;
      if (!shipToBilling) {
        const shippingContactName = String(body.shipping_contact_name ?? '').trim();
        const shippingContactPhone = String(body.shipping_contact_phone ?? '').trim();
        if (!shippingContactName || !shippingContactPhone) {
          throw new BadRequestException(
            'Fatura adresine gönderilmeyecekse sevkiyat için kişi adı ve telefonu zorunludur',
          );
        }
        orgData.shipping_contact_name = shippingContactName;
        orgData.shipping_contact_phone = shippingContactPhone;
      }
    }

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('Bu e-posta zaten kayıtlı');

    const user = await this.prisma.user.create({
      data: {
        email,
        full_name: fullName,
        phone,
        password_hash: await bcrypt.hash(password, 10),
      },
    });

    const organization = await this.prisma.organization.create({
      data: {
        ...orgData,
        members: {
          create: { user_id: user.id, role_in_org: 'OWNER' },
        },
      },
    });

    return this.issueSession(user, organization);
  }

  /** POST /auth/login — { email, password } → { token, user, organization } */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Public()
  @Post('login')
  async login(@Body() body: any) {
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (!email || !password) {
      throw new BadRequestException('E-posta ve şifre zorunludur');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { organizations: { include: { organization: true } } },
    });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    const membership = user.organizations[0];
    if (!membership) {
      throw new UnauthorizedException('Kullanıcıya bağlı organizasyon bulunamadı');
    }

    return this.issueSession(user, membership.organization, membership.role_in_org);
  }

  /** Tam oturum token'ı üretir (register ve login ortak) */
  private async issueSession(user: any, organization: any, roleInOrg = 'OWNER') {
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      full_name: user.full_name,
      system_role: user.role,
      organization_id: organization.id,
      org_type: organization.type,
      membership_tier: organization.membership_tier,
      membership_expires_at: organization.membership_expires_at,
      role_in_org: roleInOrg,
    });
    return {
      token,
      user: userView(user),
      organization: orgView(organization),
    };
  }

  /** GET /auth/me — oturum sahibinin kullanıcı + organizasyon bilgisi */
  @Get('me')
  async me(@Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) throw new UnauthorizedException();

    const organization = await this.prisma.organization.findUnique({
      where: { id: req.user.organization_id },
    });
    if (!organization) throw new UnauthorizedException();

    return { user: userView(user), organization: orgView(organization) };
  }
}
