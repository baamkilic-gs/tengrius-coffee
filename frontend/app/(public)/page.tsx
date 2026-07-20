"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowsClockwise } from "@phosphor-icons/react";
import { api, getUser, getOrganization } from "../../lib/api";
import { useFavorites } from "../../lib/useFavorites";
import { formatNumber } from "../../lib/format";
import FlagIcon from "../components/FlagIcon";
import Reveal from "../components/Reveal";
import CoffeeBeltMap from "../components/CoffeeBeltMap";
import { FavoriteButton } from "../components/ProductsListing";

const SPECIES = [
  { common: "Arabica", accent: "#5a3420", rgb: "90,52,32", desc: "Aromatik ve kompleks, dünya kahve üretiminin çoğunluğunu oluşturur.", tilt: -3 },
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
  // Yalnızca istek Premium bir organizasyona aitse dolu gelir (bkz. backend tryGetOrg)
  order_no?: number;
  buyer_name?: string;
  seller_name?: string;
  unit_price?: number;
  total_amount?: number;
  currency?: string;
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
  const [scrollY, setScrollY] = useState(0);
  const user = getUser();
  const org = getOrganization();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 0 = sayfa en üstte (büyük hero), 1 = 240px+ scroll edilmiş (daralmış hero)
  const shrink = Math.min(scrollY / 240, 1);
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();

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
      {/* Hero — açılışta hafif büyük, aşağı scroll edildikçe daralır */}
      <section className="hero-gradient text-[var(--color-cream)] overflow-hidden flex items-center relative">
        <button
          onClick={() => router.back()}
          aria-label="Geri"
          title="Geri"
          className="absolute top-2 left-2 p-1.5 rounded-full text-[var(--color-cream)]/70 hover:text-[var(--color-gold-light)] hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={16} weight="bold" />
        </button>
        <button
          onClick={() => window.location.reload()}
          aria-label="Yenile"
          title="Yenile"
          className="absolute top-2 right-2 p-1.5 rounded-full text-[var(--color-cream)]/70 hover:text-[var(--color-gold-light)] hover:bg-white/10 transition-colors"
        >
          <ArrowsClockwise size={16} weight="bold" />
        </button>
        <div
          className="max-w-3xl mx-auto px-6 text-center space-y-2 transition-[padding] duration-200 ease-out"
          style={{ paddingTop: 56 - shrink * 40, paddingBottom: 56 - shrink * 40 }}
        >
          <p
            className="enter-fade-up uppercase tracking-[0.2em] text-[var(--color-gold-light)] font-semibold transition-[font-size] duration-200 ease-out"
            style={{ fontSize: `${18 - shrink * 6}px` }}
          >
            Çiğ Kahve Pazar Yeri
          </p>
          <h1 className="enter-fade-up text-2xl sm:text-3xl font-semibold leading-tight">
            Çiğ kahvede satıcı ile kavurmacı burada buluşur
          </h1>
          <p className="enter-fade-up text-sm sm:text-base text-[var(--color-cream)]/75 max-w-xl mx-auto">
            İlan verin, teklif alın, siparişi tamamlayın. Hepsi tek platformda.
          </p>
          {!user && (
            <div className="enter-fade-up flex flex-wrap gap-3 justify-center pt-1">
              <Link href="/urunler" className="btn btn-primary">
                Ürünlere Göz At
              </Link>
              <Link href="/kayit" className="btn btn-secondary">
                Ücretsiz Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-14">
        <Reveal>
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
              <table className="w-full text-sm border-collapse data-table">
                <thead>
                  <tr>
                    <th className="py-3 px-3 w-8" />
                    <th className="py-3 px-4">Ürün</th>
                    <th className="py-3 px-4">Ülke</th>
                    <th className="py-3 px-4">Tür</th>
                    <th className="py-3 px-4">Kg Fiyatı</th>
                    <th className="py-3 px-4">Stok (ton)</th>
                    <th className="py-3 px-4">Satıcı</th>
                    <th className="py-3 px-4">İlgili Kişi</th>
                    <th className="py-3 px-4">Telefon</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                      <td className="py-2.5 px-3">
                        <FavoriteButton productId={p.id} isFavorite={isFavorite(p.id)} onToggle={toggleFavorite} />
                      </td>
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
                      <td className="py-2.5 px-4">{p.seller.contact_name ?? "-"}</td>
                      <td className="py-2.5 px-4">{p.seller.contact_phone ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Reveal>

        <Reveal>
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
        </Reveal>

        <Reveal>
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
        </Reveal>

        <Reveal>
          <h2 className="text-xl font-semibold mb-2 text-[var(--color-coffee)]">Gerçekleşmiş Satışlar</h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-1">Platformda tamamlanmış son işlemler</p>
          {user && org?.membership_tier !== "PREMIUM" && (
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              <Link href="/panel/uyelik" className="link">
                Premium üye olun
              </Link>{" "}
              ve alıcı/satıcı firma adları ile fiyat detaylarını görün.
            </p>
          )}
          {!user && <p className="text-xs text-[var(--text-tertiary)] mb-4">Premium üyeler firma adı ve fiyat detaylarını da görebilir.</p>}
          {completedSales.length === 0 ? (
            <p className="text-[var(--text-secondary)] mt-4">Henüz tamamlanmış satış yok</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--border)] mt-4">
              <table className="w-full text-sm border-collapse data-table">
                <thead>
                  <tr>
                    {completedSales[0]?.order_no !== undefined && <th className="py-3 px-4">Sipariş No</th>}
                    <th className="py-3 px-4">İlan</th>
                    <th className="py-3 px-4">Menşe</th>
                    <th className="py-3 px-4">Tür</th>
                    <th className="py-3 px-4">Miktar</th>
                    {completedSales[0]?.buyer_name !== undefined ? (
                      <>
                        <th className="py-3 px-4">Alıcı</th>
                        <th className="py-3 px-4">Satıcı</th>
                        <th className="py-3 px-4">Fiyat</th>
                      </>
                    ) : (
                      <th className="py-3 px-4">Alıcı</th>
                    )}
                    <th className="py-3 px-4">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {completedSales.map((s, i) => (
                    <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                      {s.order_no !== undefined && <td className="py-2.5 px-4 ref-no">#{s.order_no}</td>}
                      <td className="py-2.5 px-4">{s.product_title}</td>
                      <td className="py-2.5 px-4">
                        <FlagIcon country={s.origin_country} /> {s.origin_country}
                      </td>
                      <td className="py-2.5 px-4">{s.bean_type}</td>
                      <td className="py-2.5 px-4">{formatNumber(s.quantity_tons, 1)} ton</td>
                      {s.buyer_name !== undefined ? (
                        <>
                          <td className="py-2.5 px-4">{s.buyer_name}</td>
                          <td className="py-2.5 px-4">{s.seller_name}</td>
                          <td className="py-2.5 px-4 font-semibold text-[var(--color-coffee)]">
                            {formatNumber(s.unit_price ?? 0, 4)} {s.currency}
                          </td>
                        </>
                      ) : (
                        <td className="py-2.5 px-4 text-[var(--text-secondary)]">{s.buyer_label}</td>
                      )}
                      <td className="py-2.5 px-4 text-[var(--text-tertiary)]">
                        {new Date(s.completed_at).toLocaleDateString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Reveal>

        <Reveal>
          <h2 className="text-xl font-semibold mb-2 text-[var(--color-coffee)]">Kahve Kuşağı</h2>
          <p className="text-sm text-[var(--text-tertiary)] mb-5">
            Çiğ kahve, ekvator çevresindeki "Kahve Kuşağı" boyunca Amerika, Afrika ve Asya'da yetişir
          </p>
          <CoffeeBeltMap />
        </Reveal>
      </div>
    </div>
  );
}
