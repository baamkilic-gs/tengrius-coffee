"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import CoffeeBean from "../components/CoffeeBean";

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
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-[var(--color-cream)] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 items-center gap-10">
          <div className="space-y-5 text-center md:text-left">
            <p className="uppercase tracking-[0.2em] text-xs text-[var(--color-gold-light)] font-semibold">
              Çiğ Kahve Pazar Yeri
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Dünyanın kahvesi,
              <br />
              tek borsada buluşuyor
            </h1>
            <p className="text-[var(--color-cream)]/80 max-w-md mx-auto md:mx-0">
              Alıcı ve satıcıları aynı platformda buluşturan çift taraflı çiğ kahve pazar yeri.
              Güncel fiyatları takip et, teklif ver, güvenle satın al.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
              <Link
                href="/urunler"
                className="bg-[var(--color-gold)] text-[var(--color-coffee-dark)] px-5 py-2.5 rounded-full font-semibold hover:bg-[var(--color-gold-light)] transition-colors"
              >
                Ürünlere Göz At
              </Link>
              <Link
                href="/kayit"
                className="border border-[var(--color-gold-light)]/60 px-5 py-2.5 rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Ücretsiz Kayıt Ol
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center items-center h-56 md:h-72">
            <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full bean-glow" />
            <div className="bean-stage relative">
              <div className="bean-float">
                <CoffeeBean size={140} className="bean-spin" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-coffee)]">Güncel Borsa Fiyatları</h2>
          {loading ? (
            <p className="text-gray-500">Yükleniyor…</p>
          ) : priceList.length === 0 ? (
            <p className="text-gray-500">Henüz aktif ilan yok</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left bg-[var(--color-coffee)] text-[var(--color-cream)]">
                    <th className="py-3 px-4 font-medium">Ülke</th>
                    <th className="py-3 px-4 font-medium">Tür</th>
                    <th className="py-3 px-4 font-medium">Ortalama Fiyat</th>
                    <th className="py-3 px-4 font-medium">İlan Sayısı</th>
                  </tr>
                </thead>
                <tbody>
                  {priceList.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-[var(--color-cream)]">
                      <td className="py-3 px-4">{item.country}</td>
                      <td className="py-3 px-4">{item.bean_type}</td>
                      <td className="py-3 px-4 font-semibold text-[var(--color-coffee)]">
                        {item.avg_price} {item.currency}
                      </td>
                      <td className="py-3 px-4">{item.listing_count}</td>
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
                  className="card-lift bg-white border border-gray-200 rounded-xl p-5 hover:border-[var(--color-gold)]"
                >
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-gray-500">
                    {p.country} · {p.bean_type}
                  </p>
                  <p className="mt-3 text-[var(--color-coffee)] font-semibold">
                    {p.price_per_unit} {p.currency} / {p.pricing_unit === "CONTAINER" ? "konteyner" : "çuval"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{p.seller.name}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
