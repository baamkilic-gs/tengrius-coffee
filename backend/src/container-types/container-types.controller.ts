import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Public } from '../auth/public.decorator';

/**
 * Konteyner tipi parametre tablosu (ör. "20' Standart Konteyner" = 19200kg).
 * Ürün fiyatlarındaki otomatik kg→ton/konteyner çevrimi bu tabloya dayanır.
 * Yönetimi (ekleme/güncelleme) yalnızca ADMIN sistem rolüne açıktır.
 */
@Controller('container-types')
export class ContainerTypesController {
  constructor(private readonly prisma: PrismaService) {}

  /** GET /container-types — herkese açık, aktif konteyner tipleri (ürün formunda seçim için) */
  @Public()
  @Get()
  async list() {
    return this.prisma.containerType.findMany({
      where: { is_active: true },
      orderBy: { capacity_kg: 'asc' },
    });
  }

  /** POST /container-types — yeni konteyner tipi (yalnız ADMIN) */
  @Post()
  async create(@Req() req: any, @Body() body: any) {
    this.requireAdmin(req);

    const name = String(body.name ?? '').trim();
    const capacityKg = Number(body.capacity_kg);
    if (!name) throw new BadRequestException('Ad zorunludur');
    if (!Number.isFinite(capacityKg) || capacityKg <= 0) {
      throw new BadRequestException('Geçerli bir kapasite (kg) girin');
    }

    return this.prisma.containerType.create({
      data: {
        name,
        capacity_kg: capacityKg,
        bag_count: body.bag_count ? Number(body.bag_count) : null,
        bag_weight_kg: body.bag_weight_kg ? Number(body.bag_weight_kg) : null,
      },
    });
  }

  /** PATCH /container-types/:id — güncelle veya pasife al (yalnız ADMIN) */
  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.requireAdmin(req);

    const existing = await this.prisma.containerType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Konteyner tipi bulunamadı');

    const data: any = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.capacity_kg !== undefined) data.capacity_kg = Number(body.capacity_kg);
    if (body.bag_count !== undefined) data.bag_count = body.bag_count === null ? null : Number(body.bag_count);
    if (body.bag_weight_kg !== undefined) {
      data.bag_weight_kg = body.bag_weight_kg === null ? null : Number(body.bag_weight_kg);
    }
    if (body.is_active !== undefined) data.is_active = Boolean(body.is_active);

    return this.prisma.containerType.update({ where: { id }, data });
  }

  private requireAdmin(req: any) {
    if (req.user?.system_role !== 'ADMIN') {
      throw new ForbiddenException('Bu işlem için yönetici yetkisi gerekir');
    }
  }
}
