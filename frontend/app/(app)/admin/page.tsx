"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getUser } from "../../../lib/api";

interface ContainerType {
  id: string;
  name: string;
  capacity_kg: number;
  bag_count: number | null;
  bag_weight_kg: number | null;
  is_active: boolean;
}

const emptyForm = { name: "", capacity_kg: "", bag_count: "", bag_weight_kg: "" };

export default function AdminPage() {
  const [ready, setReady] = useState(false);
  const [containerTypes, setContainerTypes] = useState<ContainerType[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadContainerTypes = () => {
    api("/container-types")
      .then((res) => res.json())
      .then(setContainerTypes)
      .catch(() => setContainerTypes([]));
  };

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/giris");
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/panel");
      return;
    }
    setReady(true);
    loadContainerTypes();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await api("/container-types", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        capacity_kg: Number(form.capacity_kg),
        bag_count: form.bag_count ? Number(form.bag_count) : undefined,
        bag_weight_kg: form.bag_weight_kg ? Number(form.bag_weight_kg) : undefined,
      }),
    });
    if (res.ok) {
      setForm(emptyForm);
      loadContainerTypes();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Konteyner tipi eklenemedi");
    }
  };

  const toggleActive = async (ct: ContainerType) => {
    await api(`/container-types/${ct.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !ct.is_active }),
    });
    loadContainerTypes();
  };

  if (!ready) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Admin Panel</h1>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold">Konteyner Tipleri</h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            Ürün fiyatlarındaki kg→ton/konteyner otomatik çeviriminde kullanılan parametre tablosu.
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Ad (örn. 20' Standart Konteyner)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="input"
            />
            <input
              type="number"
              placeholder="Kapasite (kg)"
              value={form.capacity_kg}
              onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })}
              required
              className="input"
            />
            <input
              type="number"
              placeholder="Çuval sayısı (opsiyonel)"
              value={form.bag_count}
              onChange={(e) => setForm({ ...form, bag_count: e.target.value })}
              className="input"
            />
            <input
              type="number"
              placeholder="Çuval ağırlığı kg (opsiyonel)"
              value={form.bag_weight_kg}
              onChange={(e) => setForm({ ...form, bag_weight_kg: e.target.value })}
              className="input"
            />
          </div>
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
          <button type="submit" className="btn btn-primary">
            Ekle
          </button>
        </form>

        <div className="space-y-2">
          {containerTypes.map((ct) => (
            <div key={ct.id} className="card flex items-center justify-between text-sm">
              <span>
                <strong>{ct.name}</strong> — {ct.capacity_kg} kg ({ct.capacity_kg / 1000} ton)
                {ct.bag_count ? ` · ${ct.bag_count} çuval x ${ct.bag_weight_kg}kg` : ""}
                {!ct.is_active && " (pasif)"}
              </span>
              <button onClick={() => toggleActive(ct)} className="link text-xs">
                {ct.is_active ? "Pasife al" : "Aktive et"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[var(--text-tertiary)] text-sm">
        Kullanıcı/ürün onayı ve daha kapsamlı üyelik yönetimi ekranları ileride eklenecek.
      </p>
    </div>
  );
}
