"use client";

import { useEffect, useState } from "react";
import { api, getUser } from "./api";

/** İlan favorileme: sunucuda organizasyon bazlı tutulur (bkz. backend ProductFavorite). */
export function useFavorites() {
  const user = getUser();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }
    api("/products/favorite-ids")
      .then((res) => (res.ok ? res.json() : []))
      .then((arr: string[]) => setIds(new Set(arr)))
      .catch(() => setIds(new Set()))
      .finally(() => setLoaded(true));
  }, [user?.id]);

  const isFavorite = (productId: string) => ids.has(productId);

  const toggleFavorite = async (productId: string) => {
    if (!user) return;
    const currentlyFavorite = ids.has(productId);
    setIds((prev) => {
      const next = new Set(prev);
      if (currentlyFavorite) next.delete(productId);
      else next.add(productId);
      return next;
    });
    await api(`/products/${productId}/favorite`, { method: currentlyFavorite ? "DELETE" : "POST" });
  };

  return { isFavorite, toggleFavorite, loggedIn: Boolean(user), loaded };
}
