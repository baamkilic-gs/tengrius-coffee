"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUser, getOrganization, AuthOrganization } from "../../../lib/api";

const LINKS = [
  { href: "/panel", label: "Genel Bakış" },
  { href: "/panel/urunlerim", label: "Ürünlerim" },
  { href: "/panel/tekliflerim", label: "Tekliflerim" },
  { href: "/panel/alarmlarim", label: "Alarmlarım" },
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
      <aside className="w-48 shrink-0 space-y-1">
        {LINKS.filter((l) => l.href !== "/panel/urunlerim" || org?.type !== "BUYER").map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded text-sm ${
              pathname === link.href
                ? "bg-[var(--color-coffee)] text-white"
                : "text-gray-600 hover:bg-gray-100"
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
