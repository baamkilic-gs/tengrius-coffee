"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatNumber } from "../../lib/format";
import FlagIcon from "./FlagIcon";
import ColumnFilterHeader from "./ColumnFilterHeader";

export interface Product {
  id: string;
  title: string;
  country: string;
  bean_type: string;
  price_per_kg: number;
  currency: string;
  quantity_tons: number;
  seller: {
    name: string;
    verified: boolean;
    contact_name: string | null;
    contact_phone: string | null;
  };
}

export type ViewMode = "grid" | "list";

const COLUMNS: { key: string; label: string }[] = [
  { key: "title", label: "Ürün" },
  { key: "country", label: "Ülke" },
  { key: "bean_type", label: "Tür" },
  { key: "price_per_kg", label: "Kg Fiyatı" },
  { key: "quantity_tons", label: "Stok (ton)" },
  { key: "seller_name", label: "Satıcı" },
  { key: "contact_name", label: "İlgili Kişi" },
  { key: "contact_phone", label: "Telefon" },
];

const columnValue = (p: Product, key: string): string => {
  switch (key) {
    case "title":
      return p.title;
    case "country":
      return p.country;
    case "bean_type":
      return p.bean_type;
    case "price_per_kg":
      return String(p.price_per_kg);
    case "quantity_tons":
      return String(p.quantity_tons);
    case "seller_name":
      return p.seller.name;
    case "contact_name":
      return p.seller.contact_name ?? "";
    case "contact_phone":
      return p.seller.contact_phone ?? "";
    default:
      return "";
  }
};

export const StarIcon = ({ filled }: { filled: boolean }) =>
  filled ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <path d="M12 3.5l2.6 5.5 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.1 6-.7z" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5l2.6 5.5 6 .7-4.4 4.1 1.2 6-5.4-3-5.4 3 1.2-6-4.4-4.1 6-.7z" />
    </svg>
  );

export function FavoriteButton({
  productId,
  isFavorite,
  onToggle,
}: {
  productId: string;
  isFavorite: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(productId);
      }}
      title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={isFavorite ? "text-[var(--color-gold)]" : "text-[var(--text-tertiary)] hover:text-[var(--color-gold)]"}
    >
      <StarIcon filled={isFavorite} />
    </button>
  );
}

export function useProductRows(products: Product[]) {
  const [view, setView] = useState<ViewMode>("list");
  const [openColumn, setOpenColumn] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [filterDrafts, setFilterDrafts] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const rows = useMemo(() => {
    let list = products.filter((p) =>
      Object.entries(columnFilters).every(([key, val]) => {
        if (!val) return true;
        return columnValue(p, key).toLocaleLowerCase("tr").includes(val.toLocaleLowerCase("tr"));
      }),
    );
    if (sort) {
      list = [...list].sort((a, b) => {
        const av = columnValue(a, sort.key);
        const bv = columnValue(b, sort.key);
        const na = Number(av);
        const nb = Number(bv);
        const cmp = av !== "" && bv !== "" && !isNaN(na) && !isNaN(nb) ? na - nb : av.localeCompare(bv, "tr");
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [products, columnFilters, sort]);

  return { view, setView, openColumn, setOpenColumn, columnFilters, setColumnFilters, filterDrafts, setFilterDrafts, setSort, rows };
}

export function ProductsListingView({
  rows,
  loading,
  view,
  setView,
  openColumn,
  setOpenColumn,
  columnFilters,
  setColumnFilters,
  filterDrafts,
  setFilterDrafts,
  setSort,
  emptyText = "Ürün bulunamadı",
  emptyFilterText = "Filtreyle eşleşen ilan yok",
  isFavorite,
  onToggleFavorite,
}: {
  rows: Product[];
  loading?: boolean;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  openColumn: string | null;
  setOpenColumn: (v: string | null) => void;
  columnFilters: Record<string, string>;
  setColumnFilters: (v: Record<string, string>) => void;
  filterDrafts: Record<string, string>;
  setFilterDrafts: (v: Record<string, string>) => void;
  setSort: (v: { key: string; dir: "asc" | "desc" } | null) => void;
  emptyText?: string;
  emptyFilterText?: string;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
}) {
  const showFavorites = Boolean(onToggleFavorite);

  if (loading) return <p className="text-[var(--text-secondary)]">Yükleniyor…</p>;
  if (rows.length === 0 && Object.keys(columnFilters).every((k) => !columnFilters[k])) {
    return <p className="text-[var(--text-secondary)]">{emptyText}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex border border-[var(--border)] rounded-full overflow-hidden text-sm w-fit">
        <button
          onClick={() => setView("list")}
          className={`px-4 py-1.5 transition-colors ${
            view === "list" ? "bg-[var(--color-coffee)] text-[var(--color-cream)]" : "text-[var(--text-secondary)]"
          }`}
        >
          Liste Görünümü
        </button>
        <button
          onClick={() => setView("grid")}
          className={`px-4 py-1.5 transition-colors ${
            view === "grid" ? "bg-[var(--color-coffee)] text-[var(--color-cream)]" : "text-[var(--text-secondary)]"
          }`}
        >
          Kutu Görünümü
        </button>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rows.map((p) => (
            <div key={p.id} className="card relative">
              {showFavorites && (
                <div className="absolute top-3 right-3">
                  <FavoriteButton productId={p.id} isFavorite={Boolean(isFavorite?.(p.id))} onToggle={onToggleFavorite!} />
                </div>
              )}
              <Link href={`/urunler/${p.id}`} className="block">
                <p className="font-medium pr-6">{p.title}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  <FlagIcon country={p.country} /> {p.country} · {p.bean_type}
                </p>
                <p className="mt-3 text-[var(--color-coffee)] font-semibold">
                  {formatNumber(p.price_per_kg, 4)} {p.currency} / kg
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {p.seller.name} {p.seller.verified && <span className="badge badge-verified">Yetkili Satıcı</span>} · Stok:{" "}
                  {formatNumber(p.quantity_tons, 1)} ton
                </p>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          {openColumn && <div className="fixed inset-0 z-10" onClick={() => setOpenColumn(null)} />}
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm border-collapse data-table">
              <thead>
                <tr>
                  {showFavorites && <th className="py-3 px-3 w-8" />}
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="py-3 px-4 relative">
                      <ColumnFilterHeader
                        label={col.label}
                        isOpen={openColumn === col.key}
                        onToggle={() => setOpenColumn(openColumn === col.key ? null : col.key)}
                        onSort={(dir) => {
                          setSort({ key: col.key, dir });
                          setOpenColumn(null);
                        }}
                        filterDraft={filterDrafts[col.key] ?? ""}
                        onFilterDraftChange={(v) => setFilterDrafts({ ...filterDrafts, [col.key]: v })}
                        onApply={() => {
                          setColumnFilters({ ...columnFilters, [col.key]: filterDrafts[col.key] ?? "" });
                          setOpenColumn(null);
                        }}
                        onClear={() => {
                          setColumnFilters({ ...columnFilters, [col.key]: "" });
                          setFilterDrafts({ ...filterDrafts, [col.key]: "" });
                          setOpenColumn(null);
                        }}
                        hasActiveFilter={!!columnFilters[col.key]}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length + (showFavorites ? 1 : 0)} className="py-6 px-4 text-center text-[var(--text-secondary)]">
                      {emptyFilterText}
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                      {showFavorites && (
                        <td className="py-2.5 px-3">
                          <FavoriteButton productId={p.id} isFavorite={Boolean(isFavorite?.(p.id))} onToggle={onToggleFavorite!} />
                        </td>
                      )}
                      <td className="py-2.5 px-4">
                        <Link href={`/urunler/${p.id}`} className="link font-medium">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4">
                        <FlagIcon country={p.country} /> {p.country}
                      </td>
                      <td className="py-2.5 px-4">{p.bean_type}</td>
                      <td className="py-2.5 px-4 font-semibold text-[var(--color-coffee)]">
                        {formatNumber(p.price_per_kg, 4)} {p.currency}
                      </td>
                      <td className="py-2.5 px-4">{formatNumber(p.quantity_tons, 1)}</td>
                      <td className="py-2.5 px-4 text-[var(--text-secondary)]">
                        {p.seller.name} {p.seller.verified && <span className="badge badge-verified">Yetkili Satıcı</span>}
                      </td>
                      <td className="py-2.5 px-4">{p.seller.contact_name ?? "—"}</td>
                      <td className="py-2.5 px-4">{p.seller.contact_phone ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
