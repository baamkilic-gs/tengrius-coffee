import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PriceAlertsService } from '../price-alerts/price-alerts.service';
import { Public } from '../auth/public.decorator';
import { productView, productInclude as include, isPromotedSeller } from '../common/product-view';

const PROCESSING_METHODS = ['Natural', 'Washed', 'Kurutulmuş'];

@Controller('products')
export class ProductsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly priceAlerts: PriceAlertsService,
  ) {}

  /** GET /products — herkese açık liste; ?country=&bean_type=&min_price=&max_price= (kg fiyatı) filtreleri */
  @Public()
  @Get()
  async list(@Query() query: any) {
    const where: any = { status: 'ACTIVE' };
    if (query.country) where.country = query.country;
    if (query.bean_type) where.bean_type = query.bean_type;
    if (query.min_price || query.max_price) {
      where.price_per_kg = {};
      if (query.min_price) where.price_per_kg.gte = Number(query.min_price);
      if (query.max_price) where.price_per_kg.lte = Number(query.max_price);
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
      include,
    });

    // Kayıtta "öne çıkarma" tercihlerini (KDV dahil/Türkiye geneli/aynı gün) kabul eden
    // satıcıların ürünleri, is_featured grubu içinde öne alınır (sıralama stabildir).
    const sorted = [...products].sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      const pa = isPromotedSeller(a.seller);
      const pb = isPromotedSeller(b.seller);
      if (pa !== pb) return pa ? -1 : 1;
      return 0;
    });
    return sorted.map(productView);
  }

  /** GET /products/mine — organizasyonuma ait tüm ürünler (durumu ne olursa olsun) */
  @Get('mine')
  async mine(@Req() req: any) {
    const products = await this.prisma.product.findMany({
      where: { seller_org_id: req.user.organization_id },
      orderBy: { created_at: 'desc' },
      include,
    });
    return products.map(productView);
  }

  /** GET /products/favorites — organizasyonumun favorilediği ilanlar (tam ürün görünümü) */
  @Get('favorites')
  async favorites(@Req() req: any) {
    const favorites = await this.prisma.productFavorite.findMany({
      where: { organization_id: req.user.organization_id },
      orderBy: { created_at: 'desc' },
      include: { product: { include } },
    });
    return favorites.map((f) => productView(f.product));
  }

  /** GET /products/favorite-ids — favorilenen ürün id'leri (listelerde yıldız durumunu göstermek için hafif uç) */
  @Get('favorite-ids')
  async favoriteIds(@Req() req: any) {
    const favorites = await this.prisma.productFavorite.findMany({
      where: { organization_id: req.user.organization_id },
      select: { product_id: true },
    });
    return favorites.map((f) => f.product_id);
  }

  /** GET /products/:id — ürün detayı (herkese açık) */
  @Public()
  @Get(':id')
  async get(@Param('id') id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    return productView(product);
  }

  /** POST /products/:id/favorite — ilanı favorilere ekle */
  @Post(':id/favorite')
  async addFavorite(@Req() req: any, @Param('id') id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    await this.prisma.productFavorite.upsert({
      where: { organization_id_product_id: { organization_id: req.user.organization_id, product_id: id } },
      create: { organization_id: req.user.organization_id, product_id: id },
      update: {},
    });
    return { favorited: true };
  }

  /** DELETE /products/:id/favorite — ilanı favorilerden çıkar */
  @Delete(':id/favorite')
  async removeFavorite(@Req() req: any, @Param('id') id: string) {
    await this.prisma.productFavorite.deleteMany({
      where: { organization_id: req.user.organization_id, product_id: id },
    });
    return { favorited: false };
  }

  /** POST /products — yeni parti/lot girişi (yalnız SELLER organizasyonlar) */
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (req.user.org_type !== 'SELLER') {
      throw new ForbiddenException('Ürün girişi yalnızca satıcı organizasyonlarına açıktır');
    }

    const title = String(body.title ?? '').trim();
    const country = String(body.country ?? '').trim();
    const beanType = String(body.bean_type ?? '').trim();
    const pricePerKg = Number(body.price_per_kg);
    const quantityKg = Number(body.quantity_kg);

    if (!title) throw new BadRequestException('Başlık zorunludur');
    if (!country) throw new BadRequestException('Ülke zorunludur');
    if (!beanType) throw new BadRequestException('Kahve türü (bean_type) zorunludur');
    if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) {
      throw new BadRequestException('Geçerli bir kg fiyatı girin');
    }
    if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
      throw new BadRequestException('Geçerli bir stok miktarı (kg) girin');
    }
    if (body.processing_method && !PROCESSING_METHODS.includes(body.processing_method)) {
      throw new BadRequestException('İşlem türü Natural, Washed veya Kurutulmuş olmalıdır');
    }

    let containerType: { id: string; capacity_kg: number } | null = null;
    if (body.container_type_id) {
      containerType = await this.prisma.containerType.findFirst({
        where: { id: body.container_type_id, is_active: true },
      });
      if (!containerType) throw new BadRequestException('Geçersiz konteyner tipi');
    }

    const priceTon = body.price_per_ton !== undefined && body.price_per_ton !== '' ? Number(body.price_per_ton) : null;
    const priceContainer =
      body.price_per_container !== undefined && body.price_per_container !== '' ? Number(body.price_per_container) : null;
    if (priceTon !== null && (!Number.isFinite(priceTon) || priceTon <= 0)) {
      throw new BadRequestException('Geçerli bir ton fiyatı girin');
    }
    if (priceContainer !== null && (!Number.isFinite(priceContainer) || priceContainer <= 0)) {
      throw new BadRequestException('Geçerli bir konteyner fiyatı girin');
    }

    // Öne çıkarma yalnızca Premium satıcılara açık
    const org = await this.prisma.organization.findUnique({ where: { id: req.user.organization_id } });
    const isFeatured = Boolean(body.is_featured) && org?.membership_tier === 'PREMIUM';

    const product = await this.prisma.product.create({
      data: {
        seller_org_id: req.user.organization_id,
        title,
        country,
        region: body.region ?? null,
        bean_type: beanType,
        harvest_year: body.harvest_year ? Number(body.harvest_year) : null,
        processing_method: body.processing_method ?? null,
        moisture_pct: body.moisture_pct ? Number(body.moisture_pct) : null,
        description: body.description ?? null,
        cupping_notes: body.cupping_notes ?? null,
        score: body.score ? Number(body.score) : null,
        greenbro_supplied: Boolean(body.greenbro_supplied),
        other_specs: body.other_specs ?? undefined,
        price_per_kg: pricePerKg,
        price_per_ton: priceTon,
        price_per_container: priceContainer,
        container_type_id: containerType?.id ?? null,
        currency: body.currency ?? 'USD',
        quantity_kg: quantityKg,
        is_featured: isFeatured,
        priceHistory: { create: { price: pricePerKg } },
      },
      include,
    });
    return productView(product);
  }

  /** PATCH /products/:id — kendi ürününü güncelle; kg fiyatı değişirse geçmişe kaydedilir ve alarmlar kontrol edilir */
  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ürün bulunamadı');
    if (existing.seller_org_id !== req.user.organization_id) {
      throw new ForbiddenException('Bu ürün size ait değil');
    }

    if (body.processing_method && !PROCESSING_METHODS.includes(body.processing_method)) {
      throw new BadRequestException('İşlem türü Natural, Washed veya Kurutulmuş olmalıdır');
    }

    const data: any = {};
    for (const field of ['title', 'region', 'processing_method', 'description', 'cupping_notes', 'currency']) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.moisture_pct !== undefined) data.moisture_pct = body.moisture_pct === '' ? null : Number(body.moisture_pct);
    if (body.score !== undefined) data.score = body.score === '' ? null : Number(body.score);
    if (body.greenbro_supplied !== undefined) data.greenbro_supplied = Boolean(body.greenbro_supplied);
    if (body.quantity_kg !== undefined) {
      const quantityKg = Number(body.quantity_kg);
      if (!Number.isFinite(quantityKg) || quantityKg < 0) {
        throw new BadRequestException('Geçerli bir stok miktarı (kg) girin');
      }
      data.quantity_kg = quantityKg;
    }
    if (body.status !== undefined) data.status = body.status;
    if (body.is_featured !== undefined) {
      const org = await this.prisma.organization.findUnique({ where: { id: req.user.organization_id } });
      data.is_featured = Boolean(body.is_featured) && org?.membership_tier === 'PREMIUM';
    }
    if (body.container_type_id !== undefined) {
      if (body.container_type_id === null) {
        data.container_type_id = null;
      } else {
        const containerType = await this.prisma.containerType.findFirst({
          where: { id: body.container_type_id, is_active: true },
        });
        if (!containerType) throw new BadRequestException('Geçersiz konteyner tipi');
        data.container_type_id = containerType.id;
      }
    }
    if (body.price_per_ton !== undefined) {
      data.price_per_ton = body.price_per_ton === null || body.price_per_ton === '' ? null : Number(body.price_per_ton);
    }
    if (body.price_per_container !== undefined) {
      data.price_per_container =
        body.price_per_container === null || body.price_per_container === '' ? null : Number(body.price_per_container);
    }

    let priceChanged = false;
    if (body.price_per_kg !== undefined) {
      const newPrice = Number(body.price_per_kg);
      if (!Number.isFinite(newPrice) || newPrice <= 0) {
        throw new BadRequestException('Geçerli bir kg fiyatı girin');
      }
      if (newPrice !== Number(existing.price_per_kg)) {
        data.price_per_kg = newPrice;
        priceChanged = true;
      }
    }

    const updated = await this.prisma.product.update({ where: { id }, data, include });

    if (priceChanged) {
      await this.prisma.priceHistory.create({ data: { product_id: id, price: data.price_per_kg } });
      await this.priceAlerts.checkForProduct(id, data.price_per_kg, updated.country, updated.bean_type);
    }

    return productView(updated);
  }

  /** DELETE /products/:id — kendi ürününü arşivle (fiziksel silme yerine ARCHIVED) */
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ürün bulunamadı');
    if (existing.seller_org_id !== req.user.organization_id) {
      throw new ForbiddenException('Bu ürün size ait değil');
    }

    const updated = await this.prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' }, include });
    return productView(updated);
  }
}
