"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { formatNumber } from "../../../lib/format";
import { COUNTRIES } from "../../../lib/countries";
import { flagFor } from "../../../lib/countryFlags";
import ColumnFilterHeader from "../../components/ColumnFilterHeader";

const BEAN_TYPES = ["Arabica", "Robusta", "Liberica", "Excelsa", "Blend"];

interface Product {
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

type ViewMode = "grid" | "list";

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

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [country, setCountry] = useState("");
  const [beanType, setBeanType] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("list");

  const [openColumn, setOpenColumn] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [filterDrafts, setFilterDrafts] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (beanType) params.set("bean_type", beanType);
    api(`/products?${params.toString()}`)
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

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

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">İlanlar</h1>
        <div className="flex border border-[var(--border)] rounded-full overflow-hidden text-sm">
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
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex flex-wrap gap-3"
      >
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="input">
          <option value="">Tüm ülkeler</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {flagFor(c)} {c}
            </option>
          ))}
        </select>
        <select value={beanType} onChange={(e) => setBeanType(e.target.value)} className="input">
          <option value="">Tüm türler</option>
          {BEAN_TYPES.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          Filtrele
        </button>
      </form>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Yükleniyor…</p>
      ) : products.length === 0 ? (
        <p className="text-[var(--text-secondary)]">Ürün bulunamadı</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rows.map((p) => (
            <Link key={p.id} href={`/urunler/${p.id}`} className="card block">
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {flagFor(p.country)} {p.country} · {p.bean_type}
              </p>
              <p className="mt-3 text-[var(--color-coffee)] font-semibold">
                {formatNumber(p.price_per_kg, 4)} {p.currency} / kg
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {p.seller.name} {p.seller.verified && <span className="badge badge-verified">Yetkili Satıcı</span>} · Stok:{" "}
                {formatNumber(p.quantity_tons, 1)} ton
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="relative">
          {openColumn && <div className="fixed inset-0 z-10" onClick={() => setOpenColumn(null)} />}
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-[var(--color-coffee)] text-[var(--color-cream)] text-xs uppercase tracking-wide">
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
                    <td colSpan={COLUMNS.length} className="py-6 px-4 text-center text-[var(--text-secondary)]">
                      Filtreyle eşleşen ilan yok
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-alt)]">
                      <td className="py-2.5 px-4">
                        <Link href={`/urunler/${p.id}`} className="link font-medium">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4">
                        {flagFor(p.country)} {p.country}
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
