"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { formatNumber } from "../../../../lib/format";
import { COUNTRIES } from "../../../../lib/countries";
import FlagIcon from "../../../components/FlagIcon";
import DetailModal from "../../../components/DetailModal";

const CURRENT_YEAR = new Date().getFullYear();
const HARVEST_YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const PROCESSING_METHODS = ["Natural", "Washed", "Kurutulmuş"];

interface ContainerType {
  id: string;
  name: string;
  capacity_kg: number;
}

interface Product {
  id: string;
  title: string;
  country: string;
  bean_type: string;
  price_per_kg: number;
  price_per_ton: number;
  price_per_container: number | null;
  currency: string;
  quantity_tons: number;
  status: string;
  description: string | null;
  greenbro_supplied: boolean;
  harvest_year: number | null;
  processing_method: string | null;
  moisture_pct: number | null;
  score: number | null;
  cupping_notes: string | null;
  containerType: ContainerType | null;
}

const emptyForm = {
  country: "",
  title: "",
  bean_type: "Arabica",
  quantity_tons: "",
  price_per_kg: "",
  price_per_ton: "",
  container_type_id: "",
  price_per_container: "",
  description: "",
  greenbro_supplied: false,
  harvest_year: "",
  processing_method: "",
  moisture_pct: "",
  score: "",
  cupping_notes: "",
};

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const load = () => {
    api("/products/mine")
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api("/container-types")
      .then((res) => res.json())
      .then(setContainerTypes)
      .catch(() => setContainerTypes([]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await api("/products", {
      method: "POST",
      body: JSON.stringify({
        title: form.title,
        country: form.country,
        bean_type: form.bean_type,
        price_per_kg: Number(form.price_per_kg),
        price_per_ton: form.price_per_ton ? Number(form.price_per_ton) : undefined,
        container_type_id: form.container_type_id || undefined,
        price_per_container: form.price_per_container ? Number(form.price_per_container) : undefined,
        quantity_kg: Number(form.quantity_tons) * 1000,
        description: form.description || undefined,
        greenbro_supplied: form.greenbro_supplied,
        harvest_year: form.harvest_year ? Number(form.harvest_year) : undefined,
        processing_method: form.processing_method || undefined,
        moisture_pct: form.moisture_pct ? Number(form.moisture_pct) : undefined,
        score: form.score ? Number(form.score) : undefined,
        cupping_notes: form.cupping_notes || undefined,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      const created = await res.json();
      setForm(emptyForm);
      setModalOpen(false);
      setJustAddedId(created.id);
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "İlan eklenemedi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">İlanlarım</h1>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          + Yeni İlan Ekle
        </button>
      </div>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Yükleniyor…</p>
      ) : products.length === 0 ? (
        <p className="text-[var(--text-secondary)] text-sm">
          Henüz ilanınız yok — "Yeni İlan Ekle" ile ilk partinizi ekleyin.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm border-collapse data-table">
            <thead>
              <tr>
                <th className="py-2.5 px-4">Ülke</th>
                <th className="py-2.5 px-4">Başlık</th>
                <th className="py-2.5 px-4">Açıklama</th>
                <th className="py-2.5 px-4">Kg</th>
                <th className="py-2.5 px-4">Ton</th>
                <th className="py-2.5 px-4">Stok (ton)</th>
                <th className="py-2.5 px-4">Durum</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b border-[var(--border)] last:border-0 transition-colors ${
                    p.id === justAddedId ? "bg-[var(--success-bg)]" : "hover:bg-[var(--surface-alt)]"
                  }`}
                >
                  <td className="py-2.5 px-4">
                    <FlagIcon country={p.country} /> {p.country}
                  </td>
                  <td className="py-2.5 px-4">
                    {p.title}
                    {p.greenbro_supplied && (
                      <span className="badge ml-1" title="GreenBro'ya tedarik ediliyor/uygun">
                        GreenBro
                      </span>
                    )}
                    {p.id === justAddedId && <span className="badge badge-verified ml-1">Yeni</span>}
                  </td>
                  <td className="py-2.5 px-4 max-w-[220px] truncate text-[var(--text-secondary)]">
                    {p.description ?? "—"}
                  </td>
                  <td className="py-2.5 px-4">
                    {formatNumber(p.price_per_kg, 4)} {p.currency}
                  </td>
                  <td className="py-2.5 px-4">
                    {formatNumber(p.price_per_ton)} {p.currency}
                  </td>
                  <td className="py-2.5 px-4">{formatNumber(p.quantity_tons, 1)}</td>
                  <td className="py-2.5 px-4">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <DetailModal title="Yeni İlan Ekle" onClose={() => setModalOpen(false)} maxWidth="max-w-2xl">
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
                className="input"
              >
                <option value="">Ülke seçin</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                placeholder="Başlık"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="input"
              />
              <select
                value={form.bean_type}
                onChange={(e) => setForm({ ...form, bean_type: e.target.value })}
                className="input"
              >
                <option>Arabica</option>
                <option>Robusta</option>
                <option>Liberica</option>
                <option>Excelsa</option>
                <option>Blend</option>
              </select>
              <input
                type="number"
                placeholder="Stok (ton) — örn. 19"
                value={form.quantity_tons}
                onChange={(e) => setForm({ ...form, quantity_tons: e.target.value })}
                required
                className="input"
              />
            </div>

            <div className="border-t border-[var(--border)] pt-3 space-y-2">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-semibold">Detaylar</p>
              <textarea
                placeholder="Açıklama"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="input w-full"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.harvest_year}
                  onChange={(e) => setForm({ ...form, harvest_year: e.target.value })}
                  className="input"
                >
                  <option value="">Hasat yılı seçin</option>
                  {HARVEST_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  value={form.processing_method}
                  onChange={(e) => setForm({ ...form, processing_method: e.target.value })}
                  className="input"
                >
                  <option value="">İşlem türü seçin</option>
                  {PROCESSING_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Nem oranı (%)"
                  value={form.moisture_pct}
                  onChange={(e) => setForm({ ...form, moisture_pct: e.target.value })}
                  className="input"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Skor"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                  className="input"
                />
              </div>
              <textarea
                placeholder="Tadım notları"
                value={form.cupping_notes}
                onChange={(e) => setForm({ ...form, cupping_notes: e.target.value })}
                rows={2}
                className="input w-full"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.greenbro_supplied}
                  onChange={(e) => setForm({ ...form, greenbro_supplied: e.target.checked })}
                />
                Bu parti GreenBro'ya tedarik ediliyor/uygun
              </label>
            </div>

            <div className="border-t border-[var(--border)] pt-3 space-y-2">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide font-semibold">
                Fiyatlandırma
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Kg başına fiyat (USD, zorunlu)"
                  value={form.price_per_kg}
                  onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })}
                  required
                  className="input"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ton başına fiyat (boş = otomatik)"
                  value={form.price_per_ton}
                  onChange={(e) => setForm({ ...form, price_per_ton: e.target.value })}
                  className="input"
                />
                <select
                  value={form.container_type_id}
                  onChange={(e) => setForm({ ...form, container_type_id: e.target.value })}
                  className="input"
                >
                  <option value="">Konteyner tipi seçin (opsiyonel)</option>
                  {containerTypes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.capacity_kg / 1000} ton)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Konteyner fiyatı (boş = otomatik)"
                  value={form.price_per_container}
                  onChange={(e) => setForm({ ...form, price_per_container: e.target.value })}
                  className="input"
                />
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                Ton ve konteyner fiyatlarını boş bırakırsanız kg fiyatından otomatik hesaplanır; toplu alım
                iskontosu uygulayacaksanız elle girebilirsiniz.
              </p>
            </div>

            {error && <p className="text-sm text-[var(--error)]">{error}</p>}
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Ekleniyor…" : "Ekle"}
            </button>
          </form>
        </DetailModal>
      )}

      {submitting && (
        <div className="wait-overlay fixed inset-0 z-[110] flex items-center justify-center">
          <div className="bg-[var(--surface)] rounded-[14px] shadow-2xl px-6 py-4 flex items-center gap-3">
            <span className="spinner" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Lütfen bekleyiniz…</span>
          </div>
        </div>
      )}
    </div>
  );
}
