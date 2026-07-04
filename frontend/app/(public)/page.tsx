"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

interface FeaturedProduct {
  id: string;
  title: string;
  country: string;
  bean_type: string;
  price_per_unit: number;
  currency: string;
  pricing_unit: string;
  seller: { name: string; country: string | null; verified: boolean };
}

interface PriceListItem {
  country: string;
  bean_type: string;
  currency: string;
  avg_price: number;
  listing_count: number;
}

export default function HomePage() {
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/market/home")
      .then((res) => res.json())
      .then((data) => {
        setFeatured(data.featured ?? []);
        setPriceList(data.price_list ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-[var(--color-coffee)]">Çiğ Kahve Borsası</h1>
        <p className="text-gray-600">
          Alıcı ve satıcıları tek platformda buluşturan çiğ kahve pazar yeri
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-[var(--color-coffee)]">Güncel Borsa Fiyatları</h2>
        {loading ? (
          <p className="text-gray-500">Yükleniyor…</p>
        ) : priceList.length === 0 ? (
          <p className="text-gray-500">Henüz aktif ilan yok</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left border-b border-[var(--color-gold)]">
                  <th className="py-2">Ülke</th>
                  <th className="py-2">Tür</th>
                  <th className="py-2">Ortalama Fiyat</th>
                  <th className="py-2">İlan Sayısı</th>
                </tr>
              </thead>
              <tbody>
                {priceList.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2">{item.country}</td>
                    <td className="py-2">{item.bean_type}</td>
                    <td className="py-2 font-medium">
                      {item.avg_price} {item.currency}
                    </td>
                    <td className="py-2">{item.listing_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-[var(--color-coffee)]">Öne Çıkan İlanlar</h2>
        {featured.length === 0 ? (
          <p className="text-gray-500">Henüz öne çıkan ilan yok</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/urunler/${p.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-[var(--color-gold)] transition-colors"
              >
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">
                  {p.country} · {p.bean_type}
                </p>
                <p className="mt-2 text-[var(--color-coffee)] font-semibold">
                  {p.price_per_unit} {p.currency} / {p.pricing_unit === "CONTAINER" ? "konteyner" : "çuval"}
                </p>
                <p className="text-xs text-gray-400 mt-1">{p.seller.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
