import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Public } from '../auth/public.decorator';
import { decimalFields } from '../common/serialize';
import { productView, productInclude } from '../common/product-view';

const RATES_CACHE_TTL_MS = 5 * 60 * 1000; // dış API'leri her istekte yormamak için 5dk önbellek
const GRAM_PER_OUNCE = 31.1034768;

interface RatesPayload {
  usd_try: number | null;
  eur_try: number | null;
  gold_usd_oz: number | null;
  gold_try_gram: number | null;
  btc_usd: number | null;
  updated_at: string;
}

@Controller('market')
export class MarketController {
  private ratesCache: RatesPayload | null = null;
  private ratesCacheAt = 0;

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
        include: productInclude,
      }),
      this.prisma.product.findMany({
        where: { status: 'ACTIVE' },
        select: { country: true, bean_type: true, price_per_kg: true, currency: true },
      }),
    ]);

    // Ülke + tür kırılımında ortalama kg fiyatı — basit "borsa fiyat listesi"
    const buckets = new Map<string, { country: string; bean_type: string; currency: string; total: number; count: number }>();
    for (const p of active) {
      const key = `${p.country}|${p.bean_type}|${p.currency}`;
      const bucket = buckets.get(key) ?? { country: p.country, bean_type: p.bean_type, currency: p.currency, total: 0, count: 0 };
      bucket.total += Number(p.price_per_kg);
      bucket.count += 1;
      buckets.set(key, bucket);
    }
    const priceList = Array.from(buckets.values()).map((b) => ({
      country: b.country,
      bean_type: b.bean_type,
      currency: b.currency,
      avg_price_per_kg: Math.round((b.total / b.count) * 10000) / 10000,
      listing_count: b.count,
    }));

    return {
      featured: featured.map(productView),
      price_list: priceList,
    };
  }

  /**
   * GET /market/completed-sales — anasayfa "gerçekleşmiş satışlar" vitrini.
   * Gerçek COMPLETED siparişler; rekabet hassasiyeti nedeniyle firma adı ve
   * fiyat gösterilmez, yalnızca ülke/ürün/miktar/tarih anonim olarak sunulur.
   */
  @Public()
  @Get('completed-sales')
  async completedSales() {
    const orders = await this.prisma.order.findMany({
      where: { order_status: 'COMPLETED' },
      take: 12,
      orderBy: { created_at: 'desc' },
      include: {
        product: { select: { title: true, country: true, bean_type: true } },
        buyer: { select: { country: true } },
      },
    });

    return orders.map((o) => ({
      product_title: o.product.title,
      origin_country: o.product.country,
      bean_type: o.product.bean_type,
      quantity_tons: Math.round((o.quantity_kg / 1000) * 10) / 10,
      buyer_label: o.buyer.country ? `${o.buyer.country} merkezli bir alıcı` : 'Bir alıcı',
      completed_at: o.created_at,
    }));
  }

  /**
   * GET /market/rates — kayan yazı için referans kurlar (USD/TRY, EUR/TRY, gram altın, BTC/USD).
   * Üçüncü parti API'ler (Frankfurter/CoinGecko/gold-api.com) ücretsiz ve anahtarsız;
   * biri başarısız olursa o alan null döner, diğerleri etkilenmez. 5dk önbelleklenir.
   */
  @Public()
  @Get('rates')
  async rates(): Promise<RatesPayload> {
    if (this.ratesCache && Date.now() - this.ratesCacheAt < RATES_CACHE_TTL_MS) {
      return this.ratesCache;
    }

    const [fx, btc, gold] = await Promise.allSettled([
      fetch('https://api.frankfurter.app/latest?from=USD&to=TRY,EUR').then((r) => r.json()),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd').then((r) => r.json()),
      fetch('https://api.gold-api.com/price/XAU').then((r) => r.json()),
    ]);

    const usdTry = fx.status === 'fulfilled' ? Number(fx.value?.rates?.TRY) : null;
    const eurPerUsd = fx.status === 'fulfilled' ? Number(fx.value?.rates?.EUR) : null;
    const eurTry = usdTry && eurPerUsd ? usdTry / eurPerUsd : null;
    const btcUsd = btc.status === 'fulfilled' ? Number(btc.value?.bitcoin?.usd) : null;
    const goldUsdOz = gold.status === 'fulfilled' ? Number(gold.value?.price) : null;
    const goldTryGram = goldUsdOz && usdTry ? (goldUsdOz / GRAM_PER_OUNCE) * usdTry : null;

    const payload: RatesPayload = {
      usd_try: Number.isFinite(usdTry) ? usdTry : null,
      eur_try: eurTry && Number.isFinite(eurTry) ? Math.round(eurTry * 100) / 100 : null,
      gold_usd_oz: Number.isFinite(goldUsdOz) ? goldUsdOz : null,
      gold_try_gram: goldTryGram && Number.isFinite(goldTryGram) ? Math.round(goldTryGram * 100) / 100 : null,
      btc_usd: Number.isFinite(btcUsd) ? btcUsd : null,
      updated_at: new Date().toISOString(),
    };

    this.ratesCache = payload;
    this.ratesCacheAt = Date.now();
    return payload;
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
