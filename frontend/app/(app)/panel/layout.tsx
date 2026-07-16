"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser, getOrganization, AuthOrganization } from "../../../lib/api";

const LINKS = [
  { href: "/panel", label: "Genel Bakış" },
  { href: "/panel/urunlerim", label: "Ürünlerim" },
  { href: "/panel/tekliflerim", label: "Tekliflerim" },
  { href: "/panel/siparislerim", label: "Siparişlerim" },
  { href: "/panel/uyelik", label: "Üyelik" },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<AuthOrganization | null>(null);
  const [checked, setChecked] = useState(false);
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

  if (!checked) return null;

  const canSell = org?.type === "SELLER";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-4 sm:gap-8">
      <aside className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible -mx-6 px-6 sm:mx-0 sm:px-0 sm:w-48 sm:shrink-0">
        {LINKS.filter((l) => l.href !== "/panel/urunlerim" || canSell).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 sm:shrink whitespace-nowrap block px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === link.href
                ? "bg-[var(--color-coffee)] text-[var(--color-cream)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-alt)]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
