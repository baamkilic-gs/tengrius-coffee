import { decimalFields } from './serialize';

const KG_PER_TON = 1000;

/** Ürün ilişkilerini (satıcı + konteyner tipi) çözmek için ortak include nesnesi. */
export const productInclude = {
  seller: { select: { id: true, name: true, country: true, verified: true } },
  containerType: true,
};

/**
 * Kanonik fiyat kg başınadır; ton/konteyner fiyatı satıcı tarafından elle
 * girilmemişse ContainerType kapasitesine göre burada hesaplanır — böylece
 * bir konteyner tipinin kapasitesi sonradan değişirse otomatik fiyatlar da
 * güncel kalır.
 */
export const productView = (p: any) => {
  const v = decimalFields(p, ['price_per_kg', 'price_per_ton', 'price_per_container']);
  const priceKg = v.price_per_kg;
  v.price_per_ton = v.price_per_ton ?? (priceKg != null ? Math.round(priceKg * KG_PER_TON * 100) / 100 : null);
  if (v.price_per_container == null && p.containerType) {
    v.price_per_container = Math.round(priceKg * p.containerType.capacity_kg * 100) / 100;
  }
  v.quantity_tons = Math.round((p.quantity_kg / KG_PER_TON) * 1000) / 1000;
  return v;
};
