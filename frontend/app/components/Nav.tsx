"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUser, getOrganization, clearSession, AuthUser, AuthOrganization } from "../../lib/api";
import TengriusLogo from "./TengriusLogo";

export default function Nav() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [org, setOrg] = useState<AuthOrganization | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
    setOrg(getOrganization());
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logout = () => {
    clearSession();
    router.push("/");
  };

  return (
    <header
      className={`bg-[var(--color-coffee)] text-[var(--color-cream)] px-6 py-3 flex items-center gap-3 sticky top-0 z-30 transition-shadow duration-300 ${
        scrolled ? "nav-scrolled" : ""
      }`}
    >
      <Link href="/" className="brand-logo flex items-center gap-2 shrink-0">
        <TengriusLogo size={24} className="tengrius-sun text-[var(--color-gold-light)]" />
        <span className="flex items-baseline gap-2">
          <span className="font-semibold text-lg text-[var(--color-gold-light)] font-[var(--font-heading)]">
            Tengrius
          </span>
          <span className="text-xs text-[var(--color-cream)]/60 hidden sm:inline">Kahve Borsası</span>
        </span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-4 text-sm min-w-0 ml-auto">
        {user && org ? (
          <>
            <span className="text-[var(--color-gold-light)] truncate max-w-[32vw] sm:max-w-none">
              {org.name} · {org.membership_tier === "PREMIUM" ? "Premium" : "Standart"}
            </span>
            <Link href="/panel" className="shrink-0 hover:text-[var(--color-gold-light)] transition-colors">
              Panel
            </Link>
            <button onClick={logout} className="shrink-0 hover:text-[var(--color-gold-light)] transition-colors">
              Çıkış
            </button>
          </>
        ) : (
          <>
            <Link href="/giris" className="hover:text-[var(--color-gold-light)] transition-colors">
              Giriş
            </Link>
            <Link href="/kayit" className="btn btn-primary !py-1.5 !px-3.5 !text-sm">
              Kayıt Ol
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
