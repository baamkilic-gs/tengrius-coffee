"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";

const SPECIES = [
  {
    name: "Coffea Arabica",
    common: "Arabica",
    tagline: "Küresel üretimin lideri",
    desc: "Aromatik ve kompleks — dünya kahve üretiminin çoğunluğunu oluşturur.",
    accent: "#5a3420",
    rgb: "90,52,32",
    tilt: -3,
  },
  {
    name: "Coffea Canephora",
    common: "Robusta",
    tagline: "Yüksek kafein, güçlü gövde",
    desc: "Yüksek kafeinli ve hastalıklara dirençli ana tür; sert ve dolgun bir profil sunar.",
    accent: "#7a2d1f",
    rgb: "122,45,31",
    tilt: 2,
  },
  {
    name: "Coffea Liberica",
    common: "Liberica",
    tagline: "İri çekirdek, isli aroma",
    desc: "Filipinler ve Malezya'da yetişir; çok büyük çekirdekli, isli/odunsu bir tür.",
    accent: "#3d5a3a",
    rgb: "61,90,58",
    tilt: -2,
  },
  {
    name: "Coffea Excelsa",
    common: "Excelsa",
    tagline: "Ekşimsi, meyvemsi profil",
    desc: "Botanik olarak Liberica'nın bir alt türü kabul edilir; tart ve meyvemsi notalar taşır.",
    accent: "#8a4a2a",
    rgb: "138,74,42",
    tilt: 3,
  },
];

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
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28 text-center space-y-5">
          <p className="enter-fade-up uppercase tracking-[0.2em] text-xs text-[var(--color-gold-light)] font-semibold">
            Çiğ Kahve Pazar Yeri
          </p>
          <h1
            className="enter-fade-up text-5xl md:text-6xl font-semibold leading-[1.08]"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.18)" }}
          >
            Dünyanın kahvesi,
            <br />
            tek borsada buluşuyor
          </h1>
          <p className="enter-fade-up text-[var(--color-cream)]/80 max-w-md mx-auto">
            Alıcı ve satıcıları aynı platformda buluşturan çift taraflı çiğ kahve pazar yeri.
            Güncel fiyatları takip et, teklif ver, güvenle satın al.
          </p>
          <div className="enter-fade-up flex flex-wrap gap-3 justify-center pt-2">
            <Link href="/urunler" className="btn btn-primary">
              Ürünlere Göz At
            </Link>
            <Link href="/kayit" className="btn btn-secondary">
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-[var(--color-coffee)]">Kahve Türleri</h2>
          <p className="text-sm text-gray-500 mb-5">Borsada işlem gören başlıca çiğ kahve türleri</p>

          <div className="wood-panel">
            <div className="wood-panel-rule" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 py-8 px-4">
              {SPECIES.map((s) => (
                <div key={s.common} className="flex flex-col items-center gap-4 group">
                  <div
                    className="bean-bowl"
                    style={{
                      backgroundImage: `linear-gradient(rgba(${s.rgb},0.42), rgba(${s.rgb},0.42)), url(/coffee-beans-bg.jpg)`,
                    }}
                    title={s.desc}
                  />
                  <div className="kraft-tag" style={{ transform: `rotate(${s.tilt}deg)` }}>
                    {s.common}
                  </div>
                </div>
              ))}
            </div>
            <div className="wood-panel-rule" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {SPECIES.map((s) => (
              <div key={s.common} className="text-center">
                <p className="font-semibold text-sm" style={{ color: s.accent }}>
                  {s.name}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">{s.tagline}</p>
                <p className="text-xs text-[var(--text-secondary)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

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
                <Link key={p.id} href={`/urunler/${p.id}`} className="card block">
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
