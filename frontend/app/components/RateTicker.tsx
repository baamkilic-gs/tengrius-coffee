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
  const measureRef = useRef<HTMLSpanElement>(null);
  // Track %-50 kayarak döngüye giriyor; bir kopya viewport'tan darsa döngü
  // öncesi boşluk görünür — bu yüzden viewport genişliğine göre yeterli sayıda
  // (çift adet) kopya render edilir.
  const [repeatCount, setRepeatCount] = useState(6);

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

  useEffect(() => {
    if (!rates) return;
    const measure = () => {
      const copyWidth = measureRef.current?.offsetWidth;
      if (!copyWidth) return;
      // Her yarı en az bir viewport genişliğini doldurmalı — aksi halde döngü
      // sırasında içerik biter, ekranda boşluk kalır.
      const copiesPerHalf = Math.max(1, Math.ceil(window.innerWidth / copyWidth) + 1);
      setRepeatCount((current) => Math.max(current, copiesPerHalf * 2));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [rates]);

  if (!rates) return null;

  const items = [
    { label: "USD/TRY", value: fmt(rates.usd_try), trend: trends.usd_try },
    { label: "EUR/TRY", value: fmt(rates.eur_try), trend: trends.eur_try },
    { label: "GRAM ALTIN", value: `${fmt(rates.gold_try_gram)} ₺`, trend: trends.gold_try_gram },
    { label: "ONS ALTIN", value: `$${fmt(rates.gold_usd_oz)}`, trend: trends.gold_usd_oz },
    { label: "BTC/USD", value: `$${fmt(rates.btc_usd, 0)}`, trend: trends.btc_usd },
  ];

  // İçerik çift sayıda kopyalanır — animasyon %-50 kayınca sorunsuz döngüye
  // girer; kopya sayısı viewport'u dolduracak kadar olmalı (bkz. yukarıdaki
  // ölçüm effect'i), yoksa döngü öncesi ekranda boşluk görünür.
  const renderCopy = (copyIndex: number) => (
    <span key={copyIndex} ref={copyIndex === 0 ? measureRef : undefined} className="inline-flex">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-2 px-6 whitespace-nowrap">
          <span className="text-[var(--color-gold-light)] font-semibold">{item.label}</span>
          <span className="text-[var(--color-cream)]">{item.value}</span>
          <Arrow trend={item.trend ?? "flat"} />
        </span>
      ))}
    </span>
  );

  return (
    <div className="bg-[var(--color-coffee-dark)] overflow-hidden border-b border-black/30">
      <div className="ticker-track flex text-xs py-1.5">
        {Array.from({ length: repeatCount }, (_, i) => renderCopy(i))}
      </div>
    </div>
  );
}
