"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";

interface Product {
  id: string;
  title: string;
  country: string;
  bean_type: string;
  price_per_unit: number;
  currency: string;
  pricing_unit: string;
  quantity_available: number;
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
        <input
          placeholder="Ülke"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="input"
        />
        <input
          placeholder="Tür (Arabica/Robusta/Liberica/Excelsa/Blend)"
          value={beanType}
          onChange={(e) => setBeanType(e.target.value)}
          className="input"
        />
        <button type="submit" className="btn btn-primary">
          Filtrele
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Yükleniyor…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">Ürün bulunamadı</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <Link key={p.id} href={`/urunler/${p.id}`} className="card block">
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-gray-500">
                {p.country} · {p.bean_type}
              </p>
              <p className="mt-3 text-[var(--color-coffee)] font-semibold">
                {p.price_per_unit} {p.currency} / {p.pricing_unit === "CONTAINER" ? "konteyner" : "çuval"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {p.seller.name} · Stok: {p.quantity_available}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
