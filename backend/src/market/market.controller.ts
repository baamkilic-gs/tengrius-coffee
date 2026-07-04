import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Public } from '../auth/public.decorator';
import { decimalFields } from '../common/serialize';

@Controller('market')
export class MarketController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /market/home — ana sayfa verisi: öne çıkan (premium) ürünler +
   * ülke/tür bazında güncel borsa fiyat listesi.
   */
  @Public()
  @Get('home')
  async home() {
    const [featured, active] = await Promise.all([
      this.prisma.product.findMany({
        where: { status: 'ACTIVE', is_featured: true },
        take: 12,
        orderBy: { created_at: 'desc' },
        include: { seller: { select: { name: true, country: true, verified: true } } },
      }),
      this.prisma.product.findMany({
        where: { status: 'ACTIVE' },
        select: { country: true, bean_type: true, price_per_unit: true, currency: true },
      }),
    ]);

    // Ülke + tür kırılımında ortalama fiyat — basit "borsa fiyat listesi"
    const buckets = new Map<string, { country: string; bean_type: string; currency: string; total: number; count: number }>();
    for (const p of active) {
      const key = `${p.country}|${p.bean_type}|${p.currency}`;
      const bucket = buckets.get(key) ?? { country: p.country, bean_type: p.bean_type, currency: p.currency, total: 0, count: 0 };
      bucket.total += Number(p.price_per_unit);
      bucket.count += 1;
      buckets.set(key, bucket);
    }
    const priceList = Array.from(buckets.values()).map((b) => ({
      country: b.country,
      bean_type: b.bean_type,
      currency: b.currency,
      avg_price: Math.round((b.total / b.count) * 100) / 100,
      listing_count: b.count,
    }));

    return {
      featured: featured.map((p) => decimalFields(p, ['price_per_unit'])),
      price_list: priceList,
    };
  }

  /** GET /market/price-history?product_id= — bir ürünün fiyat geçmişi (opsiyonel grafik özelliği) */
  @Public()
  @Get('price-history')
  async priceHistory(@Query('product_id') productId: string) {
    if (!productId) return [];
    const history = await this.prisma.priceHistory.findMany({
      where: { product_id: productId },
      orderBy: { recorded_at: 'asc' },
    });
    return history.map((h) => decimalFields(h, ['price']));
  }
}
