"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { useFavorites } from "../../../../lib/useFavorites";
import { Product, ProductsListingView, useProductRows } from "../../../components/ProductsListing";

export default function FavoriteProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const table = useProductRows(products);
  const { isFavorite, toggleFavorite } = useFavorites();

  const load = () => {
    setLoading(true);
    api("/products/favorites")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Favorilerden çıkarılan bir ilan listeden de hemen kaybolsun
  const toggleAndRefresh = async (id: string) => {
    await toggleFavorite(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Favori İlanlarım</h1>
      <ProductsListingView
        {...table}
        loading={loading}
        emptyText="Henüz favori ilanınız yok — İlanlar sayfasında yıldız ikonuna tıklayarak ekleyebilirsiniz."
        isFavorite={isFavorite}
        onToggleFavorite={toggleAndRefresh}
      />
    </div>
  );
}
