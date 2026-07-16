interface Pin {
  x: number;
  y: number;
  label: string;
  labelX: number;
  labelY: number;
  anchor?: "start" | "end";
}

const AMERICAS_PINS: Pin[] = [
  { x: 210, y: 145, label: "Guatemala", labelX: 100, labelY: 130, anchor: "end" },
  { x: 222, y: 168, label: "Honduras", labelX: 100, labelY: 168, anchor: "end" },
  { x: 205, y: 195, label: "Kosta Rika", labelX: 100, labelY: 200, anchor: "end" },
  { x: 240, y: 235, label: "Kolombiya", labelX: 110, labelY: 275, anchor: "end" },
  { x: 260, y: 300, label: "Peru", labelX: 120, labelY: 340, anchor: "end" },
  { x: 320, y: 330, label: "Brezilya", labelX: 340, labelY: 400 },
];

const AFRICA_PINS: Pin[] = [
  { x: 585, y: 215, label: "Etiyopya", labelX: 640, labelY: 195 },
  { x: 570, y: 260, label: "Uganda", labelX: 470, labelY: 300, anchor: "end" },
  { x: 590, y: 275, label: "Kenya", labelX: 650, labelY: 275 },
  { x: 585, y: 320, label: "Tanzanya", labelX: 650, labelY: 335 },
];

const ASIA_PINS: Pin[] = [
  { x: 800, y: 175, label: "Hindistan", labelX: 830, labelY: 150 },
  { x: 900, y: 210, label: "Vietnam", labelX: 950, labelY: 195 },
  { x: 895, y: 250, label: "Endonezya", labelX: 950, labelY: 260 },
  { x: 985, y: 265, label: "Papua Yeni Gine", labelX: 1015, labelY: 300 },
];

function PinGroup({ pins, dotColor }: { pins: Pin[]; dotColor: string }) {
  return (
    <>
      {pins.map((p) => (
        <g key={p.label}>
          <line x1={p.x} y1={p.y} x2={p.labelX} y2={p.labelY} stroke="rgba(247,244,238,0.35)" strokeWidth="1" />
          <circle cx={p.x} cy={p.y} r="4" fill={dotColor} stroke="#F7F4EE" strokeWidth="1.5" />
          <text
            x={p.labelX + (p.anchor === "end" ? -6 : 6)}
            y={p.labelY}
            textAnchor={p.anchor ?? "start"}
            fontFamily="var(--font-mono)"
            fontSize="13"
            fill="#F7F4EE"
            dominantBaseline="middle"
          >
            {p.label}
          </text>
        </g>
      ))}
    </>
  );
}

/**
 * Stilize "Kahve Kuşağı" (Coffee Belt) illüstrasyonu — gerçek coğrafi harita değil,
 * kıtaları basitleştirilmiş bloklar olarak gösteren özgün bir infografik.
 * Bölge renkleri (mavi/kırmızı/altın) kasıtlı olarak kategorik — DESIGN.md'nin
 * "tek vurgu rengi" kuralının, bölge ayrımı gösteren bu özel infografik için
 * bilinçli istisnası.
 */
export default function CoffeeBeltMap() {
  return (
    <svg viewBox="0 0 1200 600" className="w-full h-auto" role="img" aria-label="Kahve Kuşağı dünya haritası">
      <rect width="1200" height="600" rx="16" fill="#241B14" />

      {/* Kuşak vurgusu — ekvator bandı */}
      <rect x="0" y="210" width="1200" height="150" fill="#C8763A" opacity="0.08" />
      <line x1="0" y1="210" x2="1200" y2="210" stroke="#C8763A" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
      <line x1="0" y1="360" x2="1200" y2="360" stroke="#C8763A" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />

      {/* Amerika bloğu */}
      <path
        d="M195,60 C260,55 300,110 290,170 C282,215 320,240 330,300 C345,370 300,430 260,470 C220,500 170,480 165,430 C160,380 130,340 140,280 C150,220 120,170 150,120 C165,90 175,65 195,60 Z"
        fill="#3E7FA6"
        opacity="0.85"
      />

      {/* Afrika + Ortadoğu bloğu */}
      <path
        d="M560,140 C610,130 650,150 660,190 C670,225 655,250 665,290 C675,335 650,380 610,410 C580,432 555,415 545,380 C535,345 510,320 515,280 C520,240 500,200 520,170 C532,152 545,143 560,140 Z"
        fill="#B5482F"
        opacity="0.85"
      />

      {/* Asya + Okyanusya bloğu */}
      <path
        d="M780,90 C860,70 950,90 1000,130 C1040,162 1030,200 1050,235 C1070,270 1040,300 1010,290 C990,320 1000,350 970,360 C935,372 900,340 870,320 C840,300 800,300 780,270 C760,240 750,200 760,160 C766,130 762,105 780,90 Z"
        fill="#C8952E"
        opacity="0.85"
      />

      <PinGroup pins={AMERICAS_PINS} dotColor="#3E7FA6" />
      <PinGroup pins={AFRICA_PINS} dotColor="#B5482F" />
      <PinGroup pins={ASIA_PINS} dotColor="#C8952E" />

      {/* Bölge lejantı */}
      <g fontFamily="var(--font-mono)" fontSize="13" fontWeight="500">
        <circle cx="60" cy="540" r="8" fill="#3E7FA6" />
        <text x="78" y="545" fill="#F7F4EE" letterSpacing="0.04em">
          AMERİKA
        </text>
        <circle cx="220" cy="540" r="8" fill="#B5482F" />
        <text x="238" y="545" fill="#F7F4EE" letterSpacing="0.04em">
          AFRİKA
        </text>
        <circle cx="360" cy="540" r="8" fill="#C8952E" />
        <text x="378" y="545" fill="#F7F4EE" letterSpacing="0.04em">
          ASYA
        </text>
      </g>
    </svg>
  );
}
