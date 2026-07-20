"use client";

import { useEffect, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

type Region = "americas" | "africa" | "asia";

const REGION_COLOR: Record<Region, string> = {
  americas: "#3E7FA6",
  africa: "#B5482F",
  asia: "#C8952E",
};

const REGION_LABEL: Record<Region, string> = {
  americas: "Amerika",
  africa: "Afrika",
  asia: "Asya",
};

/** world-atlas (Natural Earth, kamu malı) veri setindeki İngilizce ülke adlarına göre eşleşir. */
const COFFEE_COUNTRIES: Record<string, { region: Region; label: string }> = {
  Brazil: { region: "americas", label: "Brezilya" },
  Colombia: { region: "americas", label: "Kolombiya" },
  Guatemala: { region: "americas", label: "Guatemala" },
  Honduras: { region: "americas", label: "Honduras" },
  Mexico: { region: "americas", label: "Meksika" },
  Peru: { region: "americas", label: "Peru" },
  Nicaragua: { region: "americas", label: "Nikaragua" },
  "Costa Rica": { region: "americas", label: "Kosta Rika" },
  "El Salvador": { region: "americas", label: "El Salvador" },
  Ecuador: { region: "americas", label: "Ekvador" },
  Ethiopia: { region: "africa", label: "Etiyopya" },
  Uganda: { region: "africa", label: "Uganda" },
  Kenya: { region: "africa", label: "Kenya" },
  Tanzania: { region: "africa", label: "Tanzanya" },
  "Côte d'Ivoire": { region: "africa", label: "Fildişi Sahili" },
  Vietnam: { region: "asia", label: "Vietnam" },
  Indonesia: { region: "asia", label: "Endonezya" },
  India: { region: "asia", label: "Hindistan" },
  China: { region: "asia", label: "Çin" },
  "Papua New Guinea": { region: "asia", label: "Papua Yeni Gine" },
};

const WIDTH = 1200;
const HEIGHT = 620;

/**
 * Gerçek dünya haritası (world-atlas / Natural Earth verisi, kamu malı — bkz.
 * public/world-110m.json) üzerinde en çok çiğ kahve üreten ülkeler bölgesine
 * göre (Amerika/Afrika/Asya) renklendirilmiş "Kahve Kuşağı" görselleştirmesi.
 * Yengeç/Oğlak dönenceleri arasındaki kuşak da referans çizgileriyle gösterilir.
 */
export default function CoffeeBeltMap() {
  const [features, setFeatures] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/world-110m.json")
      .then((res) => res.json())
      .then((topo) => {
        const geo: any = feature(topo, topo.objects.countries as any);
        setFeatures(geo.features);
      })
      .catch(() => setFeatures([]));
  }, []);

  if (!features || features.length === 0) {
    return <div className="w-full aspect-[2/1] rounded-xl" style={{ background: "#241B14" }} />;
  }

  const geoData = { type: "FeatureCollection", features } as any;
  const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], geoData);
  const path = geoPath(projection as any);

  const latLine = (lat: number) => {
    const points: [number, number][] = [];
    for (let lon = -180; lon <= 180; lon += 4) {
      const p = projection([lon, lat]);
      if (p) points.push(p as [number, number]);
    }
    return points.length ? `M${points.map((p) => p.join(",")).join("L")}` : "";
  };

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto rounded-xl" style={{ background: "#241B14" }}>
        {/* Yengeç (23.5°K) / Ekvator / Oğlak (23.5°G) dönenceleri — kahve kuşağının coğrafi sınırı */}
        <path d={latLine(23.5)} stroke="#C0562E" strokeWidth="1" strokeDasharray="3 5" opacity="0.35" fill="none" />
        <path d={latLine(0)} stroke="#C0562E" strokeWidth="1.25" strokeDasharray="3 5" opacity="0.5" fill="none" />
        <path d={latLine(-23.5)} stroke="#C0562E" strokeWidth="1" strokeDasharray="3 5" opacity="0.35" fill="none" />

        {features.map((f: any) => {
          const info = COFFEE_COUNTRIES[f.properties?.name];
          return (
            <path
              key={f.id ?? f.properties?.name}
              d={path(f) ?? undefined}
              fill={info ? REGION_COLOR[info.region] : "#4A3B2E"}
              stroke="#241B14"
              strokeWidth={0.6}
              opacity={info ? 0.92 : 0.5}
            >
              <title>{info ? `${info.label} (${REGION_LABEL[info.region]})` : f.properties?.name}</title>
            </path>
          );
        })}

        <g fontFamily="var(--font-mono)" fontSize="13" fontWeight="500">
          <circle cx="40" cy={HEIGHT - 26} r="7" fill={REGION_COLOR.americas} />
          <text x="56" y={HEIGHT - 21} fill="#F7F4EE" letterSpacing="0.04em">
            AMERİKA
          </text>
          <circle cx="180" cy={HEIGHT - 26} r="7" fill={REGION_COLOR.africa} />
          <text x="196" y={HEIGHT - 21} fill="#F7F4EE" letterSpacing="0.04em">
            AFRİKA
          </text>
          <circle cx="300" cy={HEIGHT - 26} r="7" fill={REGION_COLOR.asia} />
          <text x="316" y={HEIGHT - 21} fill="#F7F4EE" letterSpacing="0.04em">
            ASYA
          </text>
        </g>
      </svg>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
        {(["americas", "africa", "asia"] as Region[]).map((region) => (
          <div key={region}>
            <p className="font-mono font-semibold uppercase tracking-wide mb-1" style={{ color: REGION_COLOR[region] }}>
              {REGION_LABEL[region]}
            </p>
            <p className="text-[var(--text-secondary)]">
              {Object.values(COFFEE_COUNTRIES)
                .filter((c) => c.region === region)
                .map((c) => c.label)
                .join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
