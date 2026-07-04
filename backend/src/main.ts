import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Güvenlik başlıkları. API JSON döndürdüğü için CSP gereksiz.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Render proxy arkasında olduğumuzdan gerçek istemci IP'si X-Forwarded-For'tan
  // alınır — hız sınırının (throttler) IP bazlı doğru çalışması için gerekli.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));

  // Yayında CORS_ORIGINS="https://tengrius-coffee.vercel.app" ile kısıtlanır;
  // tanımlı değilse (yerel geliştirme) tüm origin'lere açıktır.
  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : true,
  });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}
bootstrap();
