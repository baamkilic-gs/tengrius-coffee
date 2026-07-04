"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../../../lib/api";

/**
 * Admin panel iskeleti — kullanıcı/ürün onayı, üyelik yönetimi Faz 2'de eklenecek.
 * Backend'de ADMIN sistem rolüne özel uçlar henüz yok; bu sayfa yer tutucudur.
 */
export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/giris");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/panel");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
      <h1 className="text-2xl font-bold text-[var(--color-coffee)]">Admin Panel</h1>
      <p className="text-gray-500 text-sm">
        Kullanıcı/ürün onayı ve üyelik yönetimi ekranları burada yer alacak (MVP sonrası).
      </p>
    </div>
  );
}
