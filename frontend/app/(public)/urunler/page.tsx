"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { formatNumber } from "../../../lib/format";
import { COUNTRIES } from "../../../lib/countries";

const BEAN_TYPES = ["Arabica", "Robusta", "Liberica", "Excelsa", "Blend"];

interface Product {
  id: string;
  title: string;
  country: string;
  bean_type: string;
  price_per_kg: number;
  currency: string;
  quantity_tons: number;
  seller: { name: string; verified: boolean };
}

type ViewMode = "grid" | "list";

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [country, setCountry] = useState("");
  const [beanType, setBeanType] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");

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
        <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Ürünler</h1>
        <div className="flex border border-[var(--border)] rounded-full overflow-hidden text-sm">
          <button
            onClick={() => setView("grid")}
            className={`px-4 py-1.5 transition-colors ${
              view === "grid" ? "bg-[var(--color-coffee)] text-[var(--color-cream)]" : "text-[var(--text-secondary)]"
            }`}
          >
            Kutu Görünümü
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-1.5 transition-colors ${
              view === "list" ? "bg-[var(--color-coffee)] text-[var(--color-cream)]" : "text-[var(--text-secondary)]"
            }`}
          >
            Liste Görünümü
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
              {c}
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
                {p.country} · {p.bean_type}
              </p>
              <p className="mt-3 text-[var(--color-coffee)] font-semibold">
                {formatNumber(p.price_per_kg, 4)} {p.currency} / kg
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {p.seller.name} · Stok: {formatNumber(p.quantity_tons, 1)} ton
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left bg-[var(--color-coffee)] text-[var(--color-cream)]">
                <th className="py-3 px-4 font-medium">Ürün</th>
                <th className="py-3 px-4 font-medium">Ülke</th>
                <th className="py-3 px-4 font-medium">Tür</th>
                <th className="py-3 px-4 font-medium">Kg Fiyatı</th>
                <th className="py-3 px-4 font-medium">Stok (ton)</th>
                <th className="py-3 px-4 font-medium">Satıcı</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                  <td className="py-2.5 px-4">
                    <Link href={`/urunler/${p.id}`} className="link font-medium">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4">{p.country}</td>
                  <td className="py-2.5 px-4">{p.bean_type}</td>
                  <td className="py-2.5 px-4 font-semibold text-[var(--color-coffee)]">
                    {formatNumber(p.price_per_kg, 4)} {p.currency}
                  </td>
                  <td className="py-2.5 px-4">{formatNumber(p.quantity_tons, 1)}</td>
                  <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                    {p.seller.name} {p.seller.verified ? "✓" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
