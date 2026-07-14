"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { formatNumber } from "../../../../lib/format";
import { COUNTRIES } from "../../../../lib/countries";

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
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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
    setSuccess(null);
    setSubmitting(true);
    const res = await api("/price-alerts", {
      method: "POST",
      body: JSON.stringify({ country, bean_type: beanType, target_price: Number(targetPrice), direction }),
    });
    setSubmitting(false);
    if (res.ok) {
      setTargetPrice("");
      setSuccess("Alarm kuruldu.");
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
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Fiyat Alarmlarım</h1>

      <form onSubmit={submit} className="card space-y-3">
        <h2 className="font-semibold">Yeni Alarm</h2>
        <div className="grid grid-cols-2 gap-3">
          <select value={country} onChange={(e) => setCountry(e.target.value)} required className="input">
            <option value="">Ülke seçin</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={beanType} onChange={(e) => setBeanType(e.target.value)} className="input">
            <option>Arabica</option>
            <option>Robusta</option>
            <option>Liberica</option>
            <option>Excelsa</option>
            <option>Blend</option>
          </select>
          <input
            type="number"
            step="0.0001"
            placeholder="Hedef kg fiyatı (USD)"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            required
            className="input"
          />
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className="input">
            <option value="BELOW">Fiyat altına düşünce</option>
            <option value="ABOVE">Fiyat üstüne çıkınca</option>
          </select>
        </div>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        {success && <p className="text-sm text-[var(--success)]">{success}</p>}
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Kuruluyor…" : "Alarm Kur"}
        </button>
      </form>

      {loading ? (
        <p className="text-[var(--text-secondary)]">Yükleniyor…</p>
      ) : alerts.length === 0 ? (
        <p className="text-[var(--text-secondary)] text-sm">Henüz alarmınız yok</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="card flex items-center justify-between text-sm">
              <span>
                {a.country} / {a.bean_type} — {a.direction === "BELOW" ? "≤" : "≥"}{" "}
                {formatNumber(a.target_price, 4)} USD/kg
                {!a.is_active && " (tetiklendi)"}
              </span>
              <button onClick={() => remove(a.id)} className="text-[var(--error)] text-xs hover:underline">
                Kaldır
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
