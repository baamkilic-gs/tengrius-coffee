"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser, getOrganization, api, AuthOrganization } from "../../../lib/api";
import { formatNumber } from "../../../lib/format";

const ICONS = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  ),
  listings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  ),
  myProducts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8v8.5a1 1 0 0 1-.5.87l-8 4.5a1 1 0 0 1-1 0l-8-4.5a1 1 0 0 1-.5-.87V8" />
      <path d="M3 8l9-5 9 5-9 5-9-5Z" />
    </svg>
  ),
  offers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 8v8l8 5 8-5V8l-8-5Z" />
      <path d="M12 12h.01" />
    </svg>
  ),
  orders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8V6a6 6 0 0 1 12 0v2" />
      <path d="M4 8h16l-1.2 12a1.5 1.5 0 0 1-1.5 1.4H6.7A1.5 1.5 0 0 1 5.2 20L4 8Z" />
    </svg>
  ),
  favorites: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5l2.6 5.5 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.1 6-.7z" />
    </svg>
  ),
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<AuthOrganization | null>(null);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState<{ order_count: number; total_quantity_tons: number; total_revenue: number } | null>(null);
  const pathname = usePathname();
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

  const canSell = org?.type === "SELLER";

  const railItem = (href: string, icon: React.ReactNode, title: string) => (
    <Link
      key={href}
      href={href}
      title={title}
      aria-label={title}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
        pathname === href
          ? "bg-[var(--color-coffee)] text-[var(--color-cream)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--color-coffee)]"
      }`}
    >
      {icon}
    </Link>
  );

  return (
    <div className="flex">
      <nav className="w-14 shrink-0 bg-[var(--surface-alt)] border-r border-[var(--border)] flex flex-col items-center gap-1 py-4 sticky top-0 self-start min-h-[70vh]">
        {railItem("/panel", ICONS.home, "Genel Bakış")}
        <div className="w-6 border-t border-[var(--border)] my-1" />
        {railItem("/urunler", ICONS.listings, "İlanlar")}
        {canSell && railItem("/panel/urunlerim", ICONS.myProducts, "Ürünlerim")}
        {railItem("/panel/tekliflerim", ICONS.offers, "Tekliflerim")}
        {railItem("/panel/siparislerim", ICONS.orders, "Siparişlerim")}
        {railItem("/panel/favoriler", ICONS.favorites, "Favori İlanlarım")}
      </nav>

      <div className="flex-1 min-w-0 flex">
        <div className="flex-1 min-w-0 px-6 py-8 max-w-4xl">{children}</div>

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
    </div>
  );
}
