"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import CoffeeBean from "../components/CoffeeBean";
import CoffeeCup from "../components/CoffeeCup";

const SPECIES = [
  {
    name: "Coffea Arabica",
    common: "Arabica",
    tagline: "Küresel üretimin lideri",
    desc: "Aromatik ve kompleks — dünya kahve üretiminin çoğunluğunu oluşturur.",
    accent: "#5a3420",
  },
  {
    name: "Coffea Canephora",
    common: "Robusta",
    tagline: "Yüksek kafein, güçlü gövde",
    desc: "Yüksek kafeinli ve hastalıklara dirençli ana tür; sert ve dolgun bir profil sunar.",
    accent: "#7a2d1f",
  },
  {
    name: "Coffea Liberica",
    common: "Liberica",
    tagline: "İri çekirdek, isli aroma",
    desc: "Filipinler ve Malezya'da yetişir; çok büyük çekirdekli, isli/odunsu bir tür.",
    accent: "#3d5a3a",
  },
  {
    name: "Coffea Excelsa",
    common: "Excelsa",
    tagline: "Ekşimsi, meyvemsi profil",
    desc: "Botanik olarak Liberica'nın bir alt türü kabul edilir; tart ve meyvemsi notalar taşır.",
    accent: "#7a2d1f",
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

          <div className="relative flex justify-center items-center h-64 md:h-80">
            <div className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full bean-glow" />
            <CoffeeCup size={160} />
            <div className="absolute -left-2 bottom-8 bean-orbit-1">
              <CoffeeBean size={40} />
            </div>
            <div className="absolute right-0 bottom-16 bean-orbit-2">
              <CoffeeBean size={30} />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-14">
        <section>
          <h2 className="text-xl font-semibold mb-2 text-[var(--color-coffee)]">Kahve Türleri</h2>
          <p className="text-sm text-gray-500 mb-5">Borsada işlem gören başlıca çiğ kahve türleri</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {SPECIES.map((s) => (
              <div key={s.common} className="card-lift bg-white border border-gray-200 rounded-xl p-5 text-center">
                <div className="flex justify-center mb-2">
                  <CoffeeCup size={56} showSteam={false} accent={s.accent} />
                </div>
                <p className="font-semibold" style={{ color: s.accent }}>
                  {s.name}
                </p>
                <p className="text-xs text-gray-400 mb-2">{s.tagline}</p>
                <p className="text-xs text-gray-500">{s.desc}</p>
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
