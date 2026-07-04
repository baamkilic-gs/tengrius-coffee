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
import { decimalFields } from '../common/serialize';

const PRICING_UNITS = ['CONTAINER', 'BAG'];

const productView = (p: any) => decimalFields(p, ['price_per_unit']);

@Controller('products')
export class ProductsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly priceAlerts: PriceAlertsService,
  ) {}

  /** GET /products — herkese açık liste; ?country=&bean_type=&min_price=&max_price= filtreleri */
  @Public()
  @Get()
  async list(@Query() query: any) {
    const where: any = { status: 'ACTIVE' };
    if (query.country) where.country = query.country;
    if (query.bean_type) where.bean_type = query.bean_type;
    if (query.min_price || query.max_price) {
      where.price_per_unit = {};
      if (query.min_price) where.price_per_unit.gte = Number(query.min_price);
      if (query.max_price) where.price_per_unit.lte = Number(query.max_price);
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
      include: { seller: { select: { id: true, name: true, country: true, verified: true } } },
    });
    return products.map(productView);
  }

  /** GET /products/mine — organizasyonuma ait tüm ürünler (durumu ne olursa olsun) */
  @Get('mine')
  async mine(@Req() req: any) {
    const products = await this.prisma.product.findMany({
      where: { seller_org_id: req.user.organization_id },
      orderBy: { created_at: 'desc' },
    });
    return products.map(productView);
  }

  /** GET /products/:id — ürün detayı (herkese açık) */
  @Public()
  @Get(':id')
  async get(@Param('id') id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { id: true, name: true, country: true, verified: true } } },
    });
    if (!product) throw new NotFoundException('Ürün bulunamadı');
    return productView(product);
  }

  /** POST /products — yeni parti/lot girişi (yalnız SELLER/BOTH organizasyonlar) */
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (!['SELLER', 'BOTH'].includes(req.user.org_type)) {
      throw new ForbiddenException('Ürün girişi yalnızca satıcı organizasyonlarına açıktır');
    }

    const title = String(body.title ?? '').trim();
    const country = String(body.country ?? '').trim();
    const beanType = String(body.bean_type ?? '').trim();
    const pricingUnit = String(body.pricing_unit ?? '').toUpperCase();
    const pricePerUnit = Number(body.price_per_unit);
    const quantityAvailable = Number(body.quantity_available);

    if (!title) throw new BadRequestException('Başlık zorunludur');
    if (!country) throw new BadRequestException('Ülke zorunludur');
    if (!beanType) throw new BadRequestException('Kahve türü (bean_type) zorunludur');
    if (!PRICING_UNITS.includes(pricingUnit)) {
      throw new BadRequestException('pricing_unit CONTAINER veya BAG olmalıdır');
    }
    if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
      throw new BadRequestException('Geçerli bir birim fiyat girin');
    }
    if (!Number.isInteger(quantityAvailable) || quantityAvailable < 0) {
      throw new BadRequestException('Geçerli bir stok miktarı girin');
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
        cupping_notes: body.cupping_notes ?? null,
        other_specs: body.other_specs ?? undefined,
        pricing_unit: pricingUnit as any,
        price_per_unit: pricePerUnit,
        currency: body.currency ?? 'USD',
        quantity_available: quantityAvailable,
        is_featured: isFeatured,
        priceHistory: { create: { price: pricePerUnit } },
      },
    });
    return productView(product);
  }

  /** PATCH /products/:id — kendi ürününü güncelle; fiyat değişirse geçmişe kaydedilir ve alarmlar kontrol edilir */
  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Ürün bulunamadı');
    if (existing.seller_org_id !== req.user.organization_id) {
      throw new ForbiddenException('Bu ürün size ait değil');
    }

    const data: any = {};
    for (const field of [
      'title', 'region', 'processing_method', 'cupping_notes', 'currency',
    ]) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.quantity_available !== undefined) data.quantity_available = Number(body.quantity_available);
    if (body.status !== undefined) data.status = body.status;
    if (body.is_featured !== undefined) {
      const org = await this.prisma.organization.findUnique({ where: { id: req.user.organization_id } });
      data.is_featured = Boolean(body.is_featured) && org?.membership_tier === 'PREMIUM';
    }

    let priceChanged = false;
    if (body.price_per_unit !== undefined) {
      const newPrice = Number(body.price_per_unit);
      if (!Number.isFinite(newPrice) || newPrice <= 0) {
        throw new BadRequestException('Geçerli bir birim fiyat girin');
      }
      if (newPrice !== Number(existing.price_per_unit)) {
        data.price_per_unit = newPrice;
        priceChanged = true;
      }
    }

    const updated = await this.prisma.product.update({ where: { id }, data });

    if (priceChanged) {
      await this.prisma.priceHistory.create({ data: { product_id: id, price: data.price_per_unit } });
      await this.priceAlerts.checkForProduct(id, data.price_per_unit, updated.country, updated.bean_type);
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

    const updated = await this.prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
    return productView(updated);
  }
}
