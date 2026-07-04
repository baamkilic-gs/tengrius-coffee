import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Teklif verme, alarm kurma ve satın alma gibi Premium'a özel endpoint'lerde
 * AuthGuard'dan SONRA çalışır (request.user zaten dolu olmalı).
 * Üyelik JWT içindeki claim'e bakar; üyelik yükseltildiğinde kullanıcının
 * yeniden giriş yapması (veya token'ının yenilenmesi) gerekir.
 */
@Injectable()
export class PremiumGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tier = request.user?.membership_tier;
    const expiresAt = request.user?.membership_expires_at;

    const isActive =
      tier === 'PREMIUM' && (!expiresAt || new Date(expiresAt) > new Date());

    if (!isActive) {
      throw new ForbiddenException(
        'Bu işlem için Premium üyelik gereklidir',
      );
    }
    return true;
  }
}
