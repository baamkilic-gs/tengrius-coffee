"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, getOrganization, api, AuthOrganization } from "../../../lib/api";
import { formatNumber } from "../../../lib/format";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<AuthOrganization | null>(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState<{ order_count: number; total_quantity_tons: number; total_revenue: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/giris");
      return;
    }
    setOrg(getOrganization());
    setChecked(true);
  }, [router]);

  useEffect(() => {
    if (!checked) return;
    api("/orders/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, [checked]);

  if (!checked) return null;

  return (
    <div className="flex-1 min-w-0 flex">
      <div className="flex-1 min-w-0 px-4 sm:px-6 py-8">{children}</div>

      <aside className="hidden xl:block w-64 shrink-0 border-l border-[var(--border)] px-4 py-8 space-y-4">
        {org && (
          <div className="card !p-4 text-sm space-y-1.5">
            <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Organizasyon</p>
            <p className="font-semibold text-[var(--color-coffee)]">{org.name}</p>
            <p className="text-[var(--text-secondary)]">{org.type === "SELLER" ? "Çiğ Kahve Satıcısı" : "Roaster (Alıcı)"}</p>
            <Link href="/panel/uyelik" className="link block">
              {org.membership_tier === "PREMIUM" ? "Premium Üyelik" : org.membership_tier === "BASIC" ? "Basic Üyelik" : "Standart Üyelik"}
            </Link>
          </div>
        )}
        {stats && (
          <div className="card !p-4 text-sm space-y-2">
            <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
              {org?.type === "SELLER" ? "Satış Özeti" : "Alım Özeti"}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Sipariş</span>
              <span className="font-semibold">{stats.order_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Miktar</span>
              <span className="font-semibold">{formatNumber(stats.total_quantity_tons, 1)} ton</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Ciro</span>
              <span className="font-semibold">{formatNumber(stats.total_revenue)} USD</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
