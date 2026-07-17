"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser, getOrganization, AuthOrganization, AuthUser } from "../../lib/api";

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
  admin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l7 3.5v5.5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V5.5L12 2Z" />
      <path d="M9.5 12l1.8 1.8L15 10" />
    </svg>
  ),
};

/**
 * D365 tarzı sol ikon rayı — global (root layout), giriş yapılmışsa her sayfada
 * görünür kalır (yalnızca /panel altında değil). Admin hesapları yalnızca
 * Home + Admin Panel görür; diğer organizasyonlar normal marketplace ikonlarını.
 */
export default function SideRail() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [org, setOrg] = useState<AuthOrganization | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getUser());
    setOrg(getOrganization());
  }, [pathname]);

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";
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
    <nav className="w-14 shrink-0 bg-[var(--surface-alt)] border-r border-[var(--border)] flex flex-col items-center gap-1 py-4 sticky top-0 self-start min-h-[calc(100dvh-140px)]">
      {railItem("/panel", ICONS.home, "Genel Bakış")}
      <div className="w-6 border-t border-[var(--border)] my-1" />
      {isAdmin ? (
        railItem("/admin", ICONS.admin, "Admin Panel")
      ) : (
        <>
          {railItem("/panel/ilanlar", ICONS.listings, "İlanlar")}
          {canSell && railItem("/panel/urunlerim", ICONS.myProducts, "İlanlarım")}
          {railItem("/panel/tekliflerim", ICONS.offers, "Tekliflerim")}
          {railItem("/panel/siparislerim", ICONS.orders, "Siparişlerim")}
          {railItem("/panel/favoriler", ICONS.favorites, "Favori İlanlarım")}
        </>
      )}
    </nav>
  );
}
