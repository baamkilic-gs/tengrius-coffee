"use client";

import { useRouter, usePathname } from "next/navigation";

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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="flex items-center gap-2 flex-1 justify-center min-w-0">{children}</div>
      <button
        onClick={() => window.location.reload()}
        aria-label="Yenile"
        title="Yenile"
        className="p-1.5 rounded-full hover:bg-[var(--surface-hover)] hover:text-[var(--color-coffee)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6" />
          <path d="M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>
    </div>
  );
}
