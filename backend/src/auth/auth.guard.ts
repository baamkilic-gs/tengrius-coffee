import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Global JWT koruması — @Public() ile işaretlenmeyen TÜM endpoint'ler
 * geçerli bir Bearer token ister. Doğrulanan kullanıcı request.user'a yazılır.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;

    if (!token) {
      throw new UnauthorizedException('Oturum gerekli — lütfen giriş yapın');
    }

    try {
      request.user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Oturum geçersiz veya süresi dolmuş');
    }

    // Organizasyon bazlı yetkilendirme: org'suz token kabul edilmez
    if (!request.user.organization_id) {
      throw new UnauthorizedException(
        'Oturum eski sürümden kalma — lütfen yeniden giriş yapın',
      );
    }

    return true;
  }
}
