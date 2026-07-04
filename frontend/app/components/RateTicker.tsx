"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";

interface Rates {
  usd_try: number | null;
  eur_try: number | null;
  gold_usd_oz: number | null;
  gold_try_gram: number | null;
  btc_usd: number | null;
  updated_at: string;
}

type Trend = "up" | "down" | "flat";

const fmt = (n: number | null, decimals = 2) =>
  n == null ? "—" : n.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function Arrow({ trend }: { trend: Trend }) {
  if (trend === "flat") return null;
  return (
    <span className={trend === "up" ? "text-emerald-400" : "text-red-400"}>
      {trend === "up" ? "▲" : "▼"}
    </span>
  );
}

export default function RateTicker() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [trends, setTrends] = useState<Record<string, Trend>>({});
  const prevRef = useRef<Rates | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      api("/market/rates")
        .then((res) => res.json())
        .then((data: Rates) => {
          if (cancelled) return;
          const prev = prevRef.current;
          if (prev) {
            const next: Record<string, Trend> = {};
            (Object.keys(data) as (keyof Rates)[]).forEach((key) => {
              if (key === "updated_at") return;
              const a = prev[key] as number | null;
              const b = data[key] as number | null;
              next[key] = a == null || b == null || a === b ? "flat" : b > a ? "up" : "down";
            });
            setTrends(next);
          }
          prevRef.current = data;
          setRates(data);
        })
        .catch(() => {});
    };

    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!rates) return null;

  const items = [
    { label: "USD/TRY", value: fmt(rates.usd_try), trend: trends.usd_try },
    { label: "EUR/TRY", value: fmt(rates.eur_try), trend: trends.eur_try },
    { label: "GRAM ALTIN", value: `${fmt(rates.gold_try_gram)} ₺`, trend: trends.gold_try_gram },
    { label: "ONS ALTIN", value: `$${fmt(rates.gold_usd_oz)}`, trend: trends.gold_usd_oz },
    { label: "BTC/USD", value: `$${fmt(rates.btc_usd, 0)}`, trend: trends.btc_usd },
  ];

  // İçerik iki kez tekrarlanır — animasyon %-50 kayınca sorunsuz döngüye girer
  const renderItems = (keyPrefix: string) =>
    items.map((item, i) => (
      <span key={`${keyPrefix}-${i}`} className="inline-flex items-center gap-2 px-6 whitespace-nowrap">
        <span className="text-[var(--color-gold-light)] font-semibold">{item.label}</span>
        <span className="text-[var(--color-cream)]">{item.value}</span>
        <Arrow trend={item.trend ?? "flat"} />
      </span>
    ));

  return (
    <div className="bg-[var(--color-coffee-dark)] overflow-hidden border-b border-black/30">
      <div className="ticker-track flex text-xs py-1.5">
        {renderItems("a")}
        {renderItems("b")}
      </div>
    </div>
  );
}
