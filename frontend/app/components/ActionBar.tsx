"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, ArrowsClockwise } from "@phosphor-icons/react";

/**
 * D365 F&O tarzı eylem çubuğu — geri (sol) / yenile (sağ), ortada ileride
 * sayfaya özel aksiyonlar için yer var. Tüm sayfalarda görünür (root layout).
 * Anasayfada gösterilmez: hero bölümünün üstünde ayrı renkli bir çubuk
 * çirkin bir kesim izlenimi yaratıyordu — anasayfa yerine kendi geri/yenile
 * simgelerini hero'nun içine gömüyor (bkz. (public)/page.tsx).
 */
export default function ActionBar({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <div className="bg-[var(--surface-alt)] border-b border-[var(--border)] px-4 py-1.5 flex items-center justify-between text-[var(--text-secondary)]">
      <button
        onClick={() => router.back()}
        aria-label="Geri"
        title="Geri"
        className="p-1.5 rounded-full hover:bg-[var(--surface-hover)] hover:text-[var(--color-coffee)] transition-colors"
      >
        <ArrowLeft size={16} weight="bold" />
      </button>
      <div className="flex items-center gap-2 flex-1 justify-center min-w-0">{children}</div>
      <button
        onClick={() => window.location.reload()}
        aria-label="Yenile"
        title="Yenile"
        className="p-1.5 rounded-full hover:bg-[var(--surface-hover)] hover:text-[var(--color-coffee)] transition-colors"
      >
        <ArrowsClockwise size={16} weight="bold" />
      </button>
    </div>
  );
}
