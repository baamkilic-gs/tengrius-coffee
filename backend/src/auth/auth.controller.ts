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

const ORG_TYPES = ['BUYER', 'SELLER', 'BOTH'];

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
});

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * POST /auth/register — { email, password, full_name, organization_name, organization_type, country }
   * Yeni kullanıcı + organizasyon (OWNER olarak) oluşturur, oturum açar.
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Public()
  @Post('register')
  async register(@Body() body: any) {
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const fullName = String(body.full_name ?? '').trim();
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
      throw new BadRequestException('Firma/organizasyon adı zorunludur');
    }
    if (!ORG_TYPES.includes(orgType)) {
      throw new BadRequestException('Organizasyon tipi BUYER, SELLER veya BOTH olmalıdır');
    }

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('Bu e-posta zaten kayıtlı');

    const user = await this.prisma.user.create({
      data: {
        email,
        full_name: fullName,
        password_hash: await bcrypt.hash(password, 10),
      },
    });

    const organization = await this.prisma.organization.create({
      data: {
        name: orgName,
        type: orgType as any,
        country,
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
