"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getUser, getOrganization, clearSession, AuthUser, AuthOrganization } from "../../lib/api";

export default function Nav() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [org, setOrg] = useState<AuthOrganization | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getUser());
    setOrg(getOrganization());
  }, [pathname]);

  const logout = () => {
    clearSession();
    router.push("/");
  };

  return (
    <header className="bg-[var(--color-coffee)] text-[var(--color-cream)] px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-semibold text-lg text-[var(--color-gold-light)]">
        Tengrius Coffee
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {user && org ? (
          <>
            <span className="text-[var(--color-gold-light)]">
              {org.name} · {org.membership_tier === "PREMIUM" ? "Premium" : "Standart"}
            </span>
            <Link href="/panel">Panel</Link>
            <button onClick={logout} className="hover:text-[var(--color-gold-light)]">
              Çıkış
            </button>
          </>
        ) : (
          <>
            <Link href="/giris">Giriş</Link>
            <Link
              href="/kayit"
              className="bg-[var(--color-gold)] text-[var(--color-coffee-dark)] px-3 py-1.5 rounded font-medium hover:bg-[var(--color-gold-light)]"
            >
              Kayıt Ol
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
