"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { formatNumber } from "../../lib/format";
import FlagIcon from "../components/FlagIcon";

const SPECIES = [
  { common: "Arabica", accent: "#5a3420", rgb: "90,52,32", desc: "Aromatik ve kompleks — dünya kahve üretiminin çoğunluğu.", tilt: -3 },
  { common: "Robusta", accent: "#7a2d1f", rgb: "122,45,31", desc: "Yüksek kafeinli, sert ve dolgun bir profil.", tilt: 2 },
  { common: "Liberica", accent: "#3d5a3a", rgb: "61,90,58", desc: "İri çekirdekli, isli/odunsu bir tür.", tilt: -2 },
  { common: "Excelsa", accent: "#8a4a2a", rgb: "138,74,42", desc: "Ekşimsi, meyvemsi notalar taşır.", tilt: 3 },
];

interface Listing {
  id: string;
  title: string;
  country: string;
  bean_type: string;
  price_per_kg: number;
  currency: string;
  quantity_tons: number;
  seller: { name: string; verified: boolean; contact_name: string | null; contact_phone: string | null };
}

interface CompletedSale {
  product_title: string;
  origin_country: string;
  bean_type: string;
  quantity_tons: number;
  buyer_label: string;
  completed_at: string;
}

interface VerifiedSeller {
  id: string;
  name: string;
  country: string | null;
}

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [completedSales, setCompletedSales] = useState<CompletedSale[]>([]);
  const [verifiedSellers, setVerifiedSellers] = useState<VerifiedSeller[]>([]);

  useEffect(() => {
    api("/products")
      .then((res) => res.json())
      .then((data) => setListings(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setListings([]));

    api("/market/completed-sales")
      .then((res) => res.json())
      .then((data) => setCompletedSales(Array.isArray(data) ? data : []))
      .catch(() => setCompletedSales([]));

    api("/market/verified-sellers")
      .then((res) => res.json())
      .then((data) => setVerifiedSellers(Array.isArray(data) ? data : []))
      .catch(() => setVerifiedSellers([]));
  }, []);

  return (
    <div>
      {/* Hero — yalnızca butonlara kadar daraltıldı */}
      <section className="hero-gradient text-[var(--color-cream)] overflow-hidden flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-4 text-center space-y-2">
          <p className="enter-fade-up uppercase tracking-[0.2em] text-xs text-[var(--color-gold-light)] font-semibold">
            Çiğ Kahve Pazar Yeri
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
              Tüm ilanları gör →
            </Link>
          </div>
          {listings.length === 0 ? (
            <p className="text-[var(--text-secondary)]">Henüz ilan yok</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left bg-[var(--color-coffee)] text-[var(--color-cream)] text-xs uppercase tracking-wide">
                    <th className="py-3 px-4 font-medium">Ürün</th>
                    <th className="py-3 px-4 font-medium">Ülke</th>
                    <th className="py-3 px-4 font-medium">Tür</th>
                    <th className="py-3 px-4 font-medium">Kg Fiyatı</th>
                    <th className="py-3 px-4 font-medium">Stok (ton)</th>
                    <th className="py-3 px-4 font-medium">Satıcı</th>
                    <th className="py-3 px-4 font-medium">İlgili Kişi</th>
                    <th className="py-3 px-4 font-medium">Telefon</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                      <td className="py-2.5 px-4">
                        <Link href={`/urunler/${p.id}`} className="link font-medium">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4">
                        <FlagIcon country={p.country} /> {p.country}
                      </td>
                      <td className="py-2.5 px-4">{p.bean_type}</td>
                      <td className="py-2.5 px-4 font-semibold text-[var(--color-coffee)]">
                        {formatNumber(p.price_per_kg, 4)} {p.currency}
                      </td>
                      <td className="py-2.5 px-4">{formatNumber(p.quantity_tons, 1)}</td>
                      <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                        {p.seller.name} {p.seller.verified && <span className="badge badge-verified">Yetkili Satıcı</span>}
                      </td>
                      <td className="py-2.5 px-4">{p.seller.contact_name ?? "—"}</td>
                      <td className="py-2.5 px-4">{p.seller.contact_phone ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
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
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2 text-[var(--color-coffee)]">Yetkili Satıcılar</h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-5">Rozetli, doğrulanmış çiğ kahve satıcılarımız</p>
          {verifiedSellers.length === 0 ? (
            <p className="text-[var(--text-secondary)]">Henüz yetkili satıcı yok</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {verifiedSellers.map((s) => (
                <div
                  key={s.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl h-20 flex flex-col items-center justify-center text-center px-2"
                >
                  <span className="text-sm font-medium">{s.name}</span>
                  {s.country && <span className="text-xs text-[var(--text-tertiary)]">{s.country}</span>}
                </div>
              ))}
            </div>
          )}
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
                    {formatNumber(s.quantity_tons, 1)} ton — {s.buyer_label}
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
