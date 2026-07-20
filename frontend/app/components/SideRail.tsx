"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, List, Package, Handshake, ShoppingBag, Star, ShieldCheck } from "@phosphor-icons/react";
import { getUser, getOrganization, AuthOrganization, AuthUser } from "../../lib/api";

const ICONS = {
  home: <House size={18} weight="regular" />,
  listings: <List size={18} weight="regular" />,
  myProducts: <Package size={18} weight="regular" />,
  offers: <Handshake size={18} weight="regular" />,
  orders: <ShoppingBag size={18} weight="regular" />,
  favorites: <Star size={18} weight="regular" />,
  admin: <ShieldCheck size={18} weight="regular" />,
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
