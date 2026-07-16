"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { formatNumber } from "../../../lib/format";
import { COUNTRIES } from "../../../lib/countries";
import { flagFor } from "../../../lib/countryFlags";

const BEAN_TYPES = ["Arabica", "Robusta", "Liberica", "Excelsa", "Blend"];

interface Product {
  id: string;
  title: string;
  country: string;
  bean_type: string;
  price_per_kg: number;
  currency: string;
  quantity_tons: number;
  seller: {
    name: string;
    verified: boolean;
    contact_name: string | null;
    contact_phone: string | null;
  };
}

type ViewMode = "grid" | "list";

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [country, setCountry] = useState("");
  const [beanType, setBeanType] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("list");

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (beanType) params.set("bean_type", beanType);
    api(`/products?${params.toString()}`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">İlanlar</h1>
        <div className="flex border border-[var(--border)] rounded-full overflow-hidden text-sm">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 transition-colors ${
              view === "list" ? "bg-[var(--color-coffee)] text-[var(--color-cream)]" : "text-[var(--text-secondary)]"
            }`}
          >
            Liste Görünümü
          </button>
          <button
            onClick={() => setView("grid")}
            className={`px-4 py-1.5 transition-colors ${
              view === "grid" ? "bg-[var(--color-coffee)] text-[var(--color-cream)]" : "text-[var(--text-secondary)]"
            }`}
          >
            Kutu Görünümü
          </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex flex-wrap gap-3"
      >
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="input">
          <option value="">Tüm ülkeler</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {flagFor(c)} {c}
            </option>
          ))}
        </select>
        <select value={beanType} onChange={(e) => setBeanType(e.target.value)} className="input">
          <option value="">Tüm türler</option>
          {BEAN_TYPES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          Filtrele
        </button>
      </form>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Yükleniyor…</p>
      ) : products.length === 0 ? (
        <p className="text-[var(--text-secondary)]">Ürün bulunamadı</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link key={p.id} href={`/urunler/${p.id}`} className="card block">
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {flagFor(p.country)} {p.country} · {p.bean_type}
              </p>
              <p className="mt-3 text-[var(--color-coffee)] font-semibold">
                {formatNumber(p.price_per_kg, 4)} {p.currency} / kg
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {p.seller.name} {p.seller.verified && <span className="badge badge-verified">Yetkili Satıcı</span>} · Stok:{" "}
                {formatNumber(p.quantity_tons, 1)} ton
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/urunler/${p.id}`}
              className="card flex flex-wrap items-center justify-between gap-3 hover:border-[var(--color-gold)] transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {p.title}{" "}
                  <span className="text-sm font-normal text-[var(--text-secondary)]">
                    {flagFor(p.country)} {p.country} · {p.bean_type}
                  </span>
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {p.seller.name} {p.seller.verified && <span className="badge badge-verified">Yetkili Satıcı</span>}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {p.seller.contact_name ?? "—"} {p.seller.contact_phone ? `· ${p.seller.contact_phone}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[var(--color-coffee)] font-semibold">
                  {formatNumber(p.price_per_kg, 4)} {p.currency} / kg
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">Stok: {formatNumber(p.quantity_tons, 1)} ton</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
