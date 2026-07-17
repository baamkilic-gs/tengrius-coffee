"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useFavorites } from "../../lib/useFavorites";
import { COUNTRIES } from "../../lib/countries";
import { Product, ProductsListingView, useProductRows } from "./ProductsListing";

const BEAN_TYPES = ["Arabica", "Robusta", "Liberica", "Excelsa", "Blend"];

/** İlanlar listesi + filtreler — hem herkese açık /urunler hem panel içi /panel/ilanlar bunu kullanır. */
export default function ProductsBrowser({ title = "İlanlar" }: { title?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [country, setCountry] = useState("");
  const [beanType, setBeanType] = useState("");
  const [loading, setLoading] = useState(true);
  const table = useProductRows(products);
  const { isFavorite, toggleFavorite } = useFavorites();

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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">{title}</h1>

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

      <ProductsListingView {...table} loading={loading} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />
    </div>
  );
}
