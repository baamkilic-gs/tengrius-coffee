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

interface PriceListItem {
  country: string;
  bean_type: string;
  currency: string;
  avg_price_per_kg: number;
  listing_count: number;
}

interface Listing {
  id: string;
  title: string;
  country: string;
  bean_type: string;
  price_per_kg: number;
  currency: string;
  quantity_tons: number;
  seller: { name: string; verified: boolean };
}

interface CompletedSale {
  product_title: string;
  origin_country: string;
  bean_type: string;
  quantity_tons: number;
  buyer_label: string;
  completed_at: string;
}

// Gerçek logolar eklenene kadar yer tutucu — firma isimlerini/logolarını iletince değiştirilecek
const REFERENCES = ['Firma A', 'Firma B', 'Firma C', 'Firma D', 'Firma E', 'Firma F'];

export default function HomePage() {
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [completedSales, setCompletedSales] = useState<CompletedSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/market/home")
      .then((res) => res.json())
      .then((data) => {
        setPriceList(data.price_list ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api("/products")
      .then((res) => res.json())
      .then((data) => setListings(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setListings([]));

    api("/market/completed-sales")
      .then((res) => res.json())
      .then((data) => setCompletedSales(Array.isArray(data) ? data : []))
      .catch(() => setCompletedSales([]));
  }, []);

  return (
    <div>
      {/* Hero — kompakt, sayfanın yaklaşık yarısı yerine kısa bir tanıtım şeridi */}
      <section className="hero-gradient text-[var(--color-cream)] overflow-hidden flex items-center min-h-[46vh]">
        <div className="max-w-3xl mx-auto px-6 py-10 text-center space-y-4">
          <p className="enter-fade-up uppercase tracking-[0.2em] text-xs text-[var(--color-gold-light)] font-semibold">
            Çiğ Kahve Pazar Yeri
          </p>
          <h1
            className="enter-fade-up text-3xl md:text-4xl font-semibold leading-[1.15]"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.18)" }}
          >
            Dünyanın kahvesi, tek borsada buluşuyor
          </h1>
          <p className="enter-fade-up text-[var(--color-cream)]/80 max-w-md mx-auto text-sm">
            Alıcı ve satıcıları aynı platformda buluşturan çift taraflı çiğ kahve pazar yeri.
          </p>
          <div className="enter-fade-up flex flex-wrap gap-3 justify-center pt-1">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--color-coffee)]">İlanlar</h2>
            <Link href="/urunler" className="link text-sm">
              Tüm ürünleri gör →
            </Link>
          </div>
          {listings.length === 0 ? (
            <p className="text-[var(--text-secondary)]">Henüz ilan yok</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {listings.map((p) => (
                <Link key={p.id} href={`/urunler/${p.id}`} className="card block">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {p.country} · {p.bean_type}
                  </p>
                  <p className="mt-3 text-[var(--color-coffee)] font-semibold">
                    {p.price_per_kg} {p.currency} / kg
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {p.seller.name} · Stok: {p.quantity_tons} ton
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

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
            <p className="text-[var(--text-secondary)]">Yükleniyor…</p>
          ) : priceList.length === 0 ? (
            <p className="text-[var(--text-secondary)]">Henüz aktif ilan yok</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--border)] shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left bg-[var(--color-coffee)] text-[var(--color-cream)]">
                    <th className="py-3 px-4 font-medium">Ülke</th>
                    <th className="py-3 px-4 font-medium">Tür</th>
                    <th className="py-3 px-4 font-medium">Ortalama Kg Fiyatı</th>
                    <th className="py-3 px-4 font-medium">İlan Sayısı</th>
                  </tr>
                </thead>
                <tbody>
                  {priceList.map((item, i) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                      <td className="py-3 px-4">{item.country}</td>
                      <td className="py-3 px-4">{item.bean_type}</td>
                      <td className="py-3 px-4 font-semibold text-[var(--color-coffee)]">
                        {item.avg_price_per_kg} {item.currency}
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
          <h2 className="text-xl font-semibold mb-2 text-[var(--color-coffee)]">Referanslarımız</h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-5">
            Birlikte çalıştığımız firmalar (logolar yakında eklenecek)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {REFERENCES.map((name) => (
              <div
                key={name}
                className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-xl h-20 flex items-center justify-center text-sm text-[var(--text-tertiary)]"
              >
                {name}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-[var(--color-coffee)]">Gerçekleşmiş Satışlar</h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-5">Platformda tamamlanmış son işlemler</p>
          {completedSales.length === 0 ? (
            <p className="text-[var(--text-secondary)]">Henüz tamamlanmış satış yok</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {completedSales.map((s, i) => (
                <div key={i} className="card">
                  <p className="font-medium">{s.product_title}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {s.origin_country} · {s.bean_type}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-coffee)]">
                    {s.quantity_tons} ton — {s.buyer_label}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    {new Date(s.completed_at).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
