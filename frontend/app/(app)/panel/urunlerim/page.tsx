"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";

interface Product {
  id: string;
  title: string;
  country: string;
  bean_type: string;
  price_per_unit: number;
  currency: string;
  quantity_available: number;
  status: string;
}

const emptyForm = {
  title: "",
  country: "",
  bean_type: "Arabica",
  pricing_unit: "BAG",
  price_per_unit: "",
  quantity_available: "",
};

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api("/products/mine")
      .then((res) => res.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await api("/products", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        price_per_unit: Number(form.price_per_unit),
        quantity_available: Number(form.quantity_available),
      }),
    });
    if (res.ok) {
      setForm(emptyForm);
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Ürün eklenemedi");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-coffee)]">Ürünlerim</h1>

      <form onSubmit={submit} className="border border-gray-200 rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Yeni Parti Ekle</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Başlık"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <input
            placeholder="Ülke"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            required
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <select
            value={form.bean_type}
            onChange={(e) => setForm({ ...form, bean_type: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option>Arabica</option>
            <option>Robusta</option>
            <option>Blend</option>
          </select>
          <select
            value={form.pricing_unit}
            onChange={(e) => setForm({ ...form, pricing_unit: e.target.value })}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="BAG">Çuval</option>
            <option value="CONTAINER">Konteyner</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Birim Fiyat (USD)"
            value={form.price_per_unit}
            onChange={(e) => setForm({ ...form, price_per_unit: e.target.value })}
            required
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <input
            type="number"
            placeholder="Stok Miktarı"
            value={form.quantity_available}
            onChange={(e) => setForm({ ...form, quantity_available: e.target.value })}
            required
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="bg-[var(--color-coffee)] text-white px-4 py-1.5 rounded text-sm">
          Ekle
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Yükleniyor…</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-[var(--color-gold)]">
              <th className="py-2">Başlık</th>
              <th className="py-2">Ülke / Tür</th>
              <th className="py-2">Fiyat</th>
              <th className="py-2">Stok</th>
              <th className="py-2">Durum</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="py-2">{p.title}</td>
                <td className="py-2">
                  {p.country} / {p.bean_type}
                </td>
                <td className="py-2">
                  {p.price_per_unit} {p.currency}
                </td>
                <td className="py-2">{p.quantity_available}</td>
                <td className="py-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
