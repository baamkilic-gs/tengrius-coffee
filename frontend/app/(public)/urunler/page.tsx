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

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [country, setCountry] = useState("");
  const [beanType, setBeanType] = useState("");
  const [loading, setLoading] = useState(true);

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
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Ürünler</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex gap-3"
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
      ) : (
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
      )}
    </div>
  );
}
