import { decimalFields } from './serialize';

const KG_PER_TON = 1000;

/** Ürün ilişkilerini (satıcı + konteyner tipi) çözmek için ortak include nesnesi. */
export const productInclude = {
  seller: {
    select: {
      id: true,
      name: true,
      country: true,
      verified: true,
      includes_vat: true,
      nationwide_shipping: true,
      same_day_shipping: true,
      members: {
        where: { role_in_org: 'OWNER' },
        take: 1,
        select: { user: { select: { full_name: true, phone: true } } },
      },
    },
  },
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

  if (p.seller?.members !== undefined) {
    const owner = p.seller.members[0]?.user;
    v.seller = {
      ...p.seller,
      contact_name: owner?.full_name ?? null,
      contact_phone: owner?.phone ?? null,
      members: undefined,
    };
    delete v.seller.members;
  }
  return v;
};

/** Bir ürünün satıcısı "öne çıkan" tercihlerden (KDV dahil/Türkiye geneli/aynı gün) birine sahip mi */
export const isPromotedSeller = (seller: any) =>
  Boolean(seller?.includes_vat || seller?.nationwide_shipping || seller?.same_day_shipping);
