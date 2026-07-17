"use client";

import { useEffect, useState } from "react";
import { api, getUser } from "./api";

/**
 * İlan favorileme: sunucuda organizasyon bazlı tutulur (bkz. backend ProductFavorite).
 * `loggedIn` bilerek ilk render'da (SSR ve hydration anında) hep false döner —
 * localStorage sadece mount sonrası okunur. Aksi halde sunucu render'ı (oturum
 * bilgisi yok) ile istemci render'ı (oturum var) arasında fark oluşup React
 * hydration mismatch'e düşer; bu da tabloda favori sütununun aniden belirip
 * tüm satırların sola/sağa kayması gibi görünen bir "zıplama"ya yol açar.
 */
export function useFavorites() {
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    const user = getUser();
    setLoggedIn(Boolean(user));
    if (!user) return;
    api("/products/favorite-ids")
      .then((res) => (res.ok ? res.json() : []))
      .then((arr: string[]) => setIds(new Set(arr)))
      .catch(() => setIds(new Set()));
  }, []);

  const isFavorite = (productId: string) => ids.has(productId);

  const toggleFavorite = async (productId: string) => {
    if (!loggedIn) {
      window.location.href = "/giris";
      return;
    }
    const currentlyFavorite = ids.has(productId);
    setIds((prev) => {
      const next = new Set(prev);
      if (currentlyFavorite) next.delete(productId);
      else next.add(productId);
      return next;
    });
    await api(`/products/${productId}/favorite`, { method: currentlyFavorite ? "DELETE" : "POST" });
  };

  return { isFavorite, toggleFavorite, loggedIn, mounted };
}
