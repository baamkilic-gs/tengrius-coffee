"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";

interface Alert {
  id: string;
  product_id: string | null;
  bean_type: string | null;
  country: string | null;
  target_price: number;
  direction: string;
  is_active: boolean;
}

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [country, setCountry] = useState("");
  const [beanType, setBeanType] = useState("Arabica");
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState("BELOW");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api("/price-alerts/mine")
      .then((res) => res.json())
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await api("/price-alerts", {
      method: "POST",
      body: JSON.stringify({ country, bean_type: beanType, target_price: Number(targetPrice), direction }),
    });
    if (res.ok) {
      setTargetPrice("");
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.message ?? "Alarm oluşturulamadı (Premium üyelik gerekebilir)");
    }
  };

  const remove = async (id: string) => {
    await api(`/price-alerts/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-coffee)]">Fiyat Alarmlarım</h1>

      <form onSubmit={submit} className="border border-gray-200 rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Yeni Alarm</h2>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Ülke"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <select
            value={beanType}
            onChange={(e) => setBeanType(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option>Arabica</option>
            <option>Robusta</option>
            <option>Liberica</option>
            <option>Excelsa</option>
            <option>Blend</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Hedef Fiyat (USD)"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            required
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="BELOW">Fiyat altına düşünce</option>
            <option value="ABOVE">Fiyat üstüne çıkınca</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="bg-[var(--color-coffee)] text-white px-4 py-1.5 rounded text-sm">
          Alarm Kur
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Yükleniyor…</p>
      ) : alerts.length === 0 ? (
        <p className="text-gray-500 text-sm">Henüz alarmınız yok</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm">
              <span>
                {a.country} / {a.bean_type} — {a.direction === "BELOW" ? "≤" : "≥"} {a.target_price} USD
                {!a.is_active && " (tetiklendi)"}
              </span>
              <button onClick={() => remove(a.id)} className="text-red-600 text-xs">
                Kaldır
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
