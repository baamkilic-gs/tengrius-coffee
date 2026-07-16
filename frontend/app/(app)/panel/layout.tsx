"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser, getOrganization, api, AuthOrganization } from "../../../lib/api";
import { formatNumber } from "../../../lib/format";

const LINKS = [
  { href: "/panel", label: "Genel Bakış" },
  { href: "/panel/urunlerim", label: "Ürünlerim" },
  { href: "/panel/tekliflerim", label: "Tekliflerim" },
  { href: "/panel/siparislerim", label: "Siparişlerim" },
  { href: "/panel/uyelik", label: "Üyelik" },
];

const RECENT_KEY = "panel_recent_v1";
const FAV_KEY = "panel_favorites_v1";

type PanelLink = { href: string; label: string };

function readList(key: string): PanelLink[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const ICONS = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  ),
  recent: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5l2.6 5.5 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.1 6-.7z" />
    </svg>
  ),
  starFilled: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <path d="M12 3.5l2.6 5.5 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.1 6-.7z" />
    </svg>
  ),
  modules: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  ),
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<AuthOrganization | null>(null);
  const [checked, setChecked] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState<"recent" | "favorites" | "modules" | null>(null);
  const [recent, setRecent] = useState<PanelLink[]>([]);
  const [favorites, setFavorites] = useState<PanelLink[]>([]);
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
    setRecent(readList(RECENT_KEY));
    setFavorites(readList(FAV_KEY));
  }, [router]);

  useEffect(() => {
    if (!checked) return;
    api("/orders/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, [checked]);

  useEffect(() => {
    if (!checked) return;
    const current = LINKS.find((l) => l.href === pathname);
    if (!current) return;
    setRecent((prev) => {
      const next = [current, ...prev.filter((p) => p.href !== current.href)].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, [pathname, checked]);

  if (!checked) return null;

  const canSell = org?.type === "SELLER";
  const visibleLinks = LINKS.filter((l) => l.href !== "/panel/urunlerim" || canSell);
  const isFavorite = (href: string) => favorites.some((f) => f.href === href);

  const toggleFavorite = (link: PanelLink) => {
    setFavorites((prev) => {
      const next = isFavorite(link.href) ? prev.filter((f) => f.href !== link.href) : [...prev, link];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  const closeFlyout = () => setActiveFlyout(null);

  const railBtn = (
    key: "recent" | "favorites" | "modules",
    icon: React.ReactNode,
    title: string
  ) => (
    <button
      onClick={() => setActiveFlyout((cur) => (cur === key ? null : key))}
      title={title}
      aria-label={title}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
        activeFlyout === key
          ? "bg-[var(--color-coffee)] text-[var(--color-cream)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--color-coffee)]"
      }`}
    >
      {icon}
    </button>
  );

  const flyoutList = (items: PanelLink[], emptyText: string) => (
    <div className="w-64 bg-[var(--surface)] border border-[var(--border)] rounded-[10px] shadow-xl py-2">
      {items.length === 0 ? (
        <p className="px-4 py-3 text-xs text-[var(--text-tertiary)]">{emptyText}</p>
      ) : (
        items.map((link) => (
          <div
            key={link.href}
            className="flex items-center justify-between px-3 py-2 hover:bg-[var(--surface-alt)] transition-colors"
          >
            <Link href={link.href} onClick={closeFlyout} className="text-sm flex-1 min-w-0 truncate">
              {link.label}
            </Link>
            <button
              onClick={() => toggleFavorite(link)}
              aria-label="Favorilere ekle/çıkar"
              className={isFavorite(link.href) ? "text-[var(--color-gold)]" : "text-[var(--text-tertiary)] hover:text-[var(--color-gold)]"}
            >
              {isFavorite(link.href) ? ICONS.starFilled : ICONS.star}
            </button>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="flex">
      {activeFlyout && <div className="fixed inset-0 z-20" onClick={closeFlyout} />}

      <nav className="relative z-30 w-14 shrink-0 bg-[var(--surface-alt)] border-r border-[var(--border)] flex flex-col items-center gap-1 py-4 sticky top-0 self-start min-h-[70vh]">
        <Link
          href="/panel"
          title="Home"
          aria-label="Home"
          onClick={closeFlyout}
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors mb-2 ${
            pathname === "/panel"
              ? "bg-[var(--color-coffee)] text-[var(--color-cream)]"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--color-coffee)]"
          }`}
        >
          {ICONS.home}
        </Link>

        <div className="relative">
          {railBtn("recent", ICONS.recent, "Son kullanılanlar")}
          {activeFlyout === "recent" && (
            <div className="absolute left-full top-0 ml-2">
              {flyoutList(recent, "Henüz gezinme geçmişiniz yok.")}
            </div>
          )}
        </div>

        <div className="relative">
          {railBtn("favorites", ICONS.star, "Favoriler")}
          {activeFlyout === "favorites" && (
            <div className="absolute left-full top-0 ml-2">
              {flyoutList(favorites, "Favori eklemek için Modüller listesindeki yıldıza tıklayın.")}
            </div>
          )}
        </div>

        <div className="relative">
          {railBtn("modules", ICONS.modules, "Modüller")}
          {activeFlyout === "modules" && (
            <div className="absolute left-full top-0 ml-2">
              {flyoutList(visibleLinks, "Modül bulunamadı.")}
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 min-w-0 flex">
        <div className="flex-1 min-w-0 px-6 py-8 max-w-4xl">{children}</div>

        <aside className="hidden xl:block w-64 shrink-0 border-l border-[var(--border)] px-4 py-8 space-y-4">
          {org && (
            <div className="card !p-4 text-sm space-y-1.5">
              <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">Organizasyon</p>
              <p className="font-semibold text-[var(--color-coffee)]">{org.name}</p>
              <p className="text-[var(--text-secondary)]">{org.type === "SELLER" ? "Çiğ Kahve Satıcısı" : "Roaster (Alıcı)"}</p>
              <p className="text-[var(--text-secondary)]">
                {org.membership_tier === "PREMIUM" ? "Premium Üyelik" : "Standart Üyelik"}
              </p>
            </div>
          )}
          {stats && (
            <div className="card !p-4 text-sm space-y-2">
              <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                {stats && org?.type === "SELLER" ? "Satış Özeti" : "Alım Özeti"}
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
