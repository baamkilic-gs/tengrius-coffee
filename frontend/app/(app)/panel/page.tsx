"use client";

import { useEffect, useState } from "react";
import { getUser, getOrganization, api } from "../../../lib/api";
import { formatNumber } from "../../../lib/format";

interface Stats {
  role: "SELLER" | "ROASTER";
  order_count: number;
  total_quantity_kg: number;
  total_quantity_tons: number;
  total_revenue: number;
}

export default function PanelHomePage() {
  const user = getUser();
  const org = getOrganization();
  const [stats, setStats] = useState<Stats | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    api(`/orders/stats?${params.toString()}`)
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-coffee)]">Hoş geldiniz, {user?.full_name}</h1>
      {org && (
        <div className="card text-sm space-y-1">
          <p>
            <span className="text-[var(--text-tertiary)]">Organizasyon:</span> {org.name}
          </p>
          <p>
            <span className="text-[var(--text-tertiary)]">Tip:</span>{" "}
            {org.type === "SELLER" ? "Çiğ Kahve Satıcısı" : "Roaster (Alıcı)"}
          </p>
          <p>
            <span className="text-[var(--text-tertiary)]">Üyelik:</span>{" "}
            {org.membership_tier === "PREMIUM" ? "Premium" : "Standart"}
          </p>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="font-semibold text-[var(--color-coffee)]">
            {org?.type === "SELLER" ? "Satış Özeti" : "Alım Özeti"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input !py-1 w-[9.5rem]"
            />
            <span className="text-[var(--text-tertiary)]">–</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input !py-1 w-[9.5rem]"
            />
            <button type="submit" className="btn btn-secondary !py-1 !px-3 !text-xs">
              Filtrele
            </button>
          </form>
        </div>

        {loading ? (
          <p className="text-[var(--text-secondary)] text-sm">Yükleniyor…</p>
        ) : !stats ? (
          <p className="text-[var(--text-secondary)] text-sm">Veri alınamadı</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
                Toplam {stats.role === "SELLER" ? "Satış" : "Alım"} Adedi
              </p>
              <p className="text-2xl font-semibold text-[var(--color-coffee)] mt-1">{stats.order_count}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">Toplam Miktar</p>
              <p className="text-2xl font-semibold text-[var(--color-coffee)] mt-1">
                {formatNumber(stats.total_quantity_tons, 1)} ton
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">{formatNumber(stats.total_quantity_kg, 0)} kg</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">Toplam Ciro</p>
              <p className="text-2xl font-semibold text-[var(--color-coffee)] mt-1">
                {formatNumber(stats.total_revenue)} USD
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
