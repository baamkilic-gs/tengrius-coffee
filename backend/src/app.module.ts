import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';

import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth/auth.guard';
import { OrganizationsController } from './organizations/organizations.controller';
import { ProductsController } from './products/products.controller';
import { OffersController } from './offers/offers.controller';
import { PriceAlertsController } from './price-alerts/price-alerts.controller';
import { PriceAlertsService } from './price-alerts/price-alerts.service';
import { OrdersController } from './orders/orders.controller';
import { PaymentsController } from './payments/payments.controller';
import { MarketController } from './market/market.controller';
import { ContainerTypesController } from './container-types/container-types.controller';
import { NotificationsService } from './notifications/notifications.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // price-alerts periyodik kontrolü için (@Cron)
    // Hız sınırı: IP başına 60 saniyede 100 istek (DoS/aşırı sorgu koruması).
    // Login/register uçları controller'da @Throttle ile ayrıca sıkılaştırılır.
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60000, limit: 100 }] }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    OrganizationsController,
    ProductsController,
    OffersController,
    PriceAlertsController,
    OrdersController,
    PaymentsController,
    MarketController,
    ContainerTypesController,
  ],
  providers: [
    PrismaService,
    NotificationsService,
    PriceAlertsService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
