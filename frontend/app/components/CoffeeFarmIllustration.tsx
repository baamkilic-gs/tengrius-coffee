/**
 * Elle çizilmiş düz-vektör ("corporate memphis") kahve tarlası sahnesi — hero arka planı.
 * AI görsel üretimi bu oturumda kredisiz kaldığı için SVG olarak kodlandı; tüm renkler
 * marka paletiyle (terracotta/koyu kahve/krem/yeşil) birebir eşleşiyor.
 */
export default function CoffeeFarmIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Gökyüzü */}
      <rect x="0" y="0" width="1200" height="600" fill="#F7F4EE" />

      {/* Güneş + ışınlar (Tengrius güneş markasıyla aynı motif) */}
      <g transform="translate(940,120)">
        <g stroke="#D97A4E" strokeWidth="7" strokeLinecap="round">
          <line x1="0" y1="-92" x2="0" y2="-70" />
          <line x1="0" y1="70" x2="0" y2="92" />
          <line x1="-92" y1="0" x2="-70" y2="0" />
          <line x1="70" y1="0" x2="92" y2="0" />
          <line x1="-65" y1="-65" x2="-49" y2="-49" />
          <line x1="49" y1="49" x2="65" y2="65" />
          <line x1="-65" y1="65" x2="-49" y2="49" />
          <line x1="49" y1="-49" x2="65" y2="-65" />
        </g>
        <circle r="52" fill="#C0562E" />
      </g>

      {/* Bulutlar */}
      <g fill="#FFFFFF" stroke="#DED6C7" strokeWidth="2">
        <g transform="translate(180,90)">
          <ellipse cx="0" cy="10" rx="46" ry="22" />
          <ellipse cx="34" cy="0" rx="34" ry="26" />
          <ellipse cx="-32" cy="4" rx="30" ry="20" />
        </g>
        <g transform="translate(560,60)">
          <ellipse cx="0" cy="8" rx="34" ry="16" />
          <ellipse cx="24" cy="0" rx="24" ry="18" />
        </g>
        <g transform="translate(1080,220)">
          <ellipse cx="0" cy="8" rx="30" ry="15" />
          <ellipse cx="22" cy="0" rx="22" ry="16" />
        </g>
      </g>

      {/* Serpiştirilmiş pırıltı/yıldız aksanları */}
      <g fill="#C0562E">
        <path d="M110 200 l6 16 16 6 -16 6 -6 16 -6 -16 -16 -6 16 -6z" opacity="0.7" />
        <path d="M1020 340 l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5z" opacity="0.55" />
        <path d="M300 140 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" opacity="0.6" />
        <path d="M760 170 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" opacity="0.5" />
      </g>

      {/* Arka tepeler (koyu yeşil, uzak) */}
      <path d="M0 380 Q 200 320 420 370 T 820 360 T 1200 390 V600 H0 Z" fill="#3d6b4f" opacity="0.55" />

      {/* Orta tepeler */}
      <path d="M0 430 Q 180 370 380 420 Q 620 470 860 410 Q 1040 375 1200 420 V600 H0 Z" fill="#4A7A3D" />

      {/* Kahve fideleri (orta tepe sırası) */}
      <g>
        {[120, 210, 300, 470, 560, 650, 900, 990, 1080].map((x, i) => {
          const y = 448 + (i % 3) * 8;
          return (
            <g key={`mid-${x}`} transform={`translate(${x},${y})`}>
              <ellipse cx="0" cy="0" rx="26" ry="20" fill="#3d6b4f" />
              <circle cx="-8" cy="-6" r="4" fill="#C0562E" />
              <circle cx="7" cy="-2" r="4" fill="#8a2d1f" />
              <circle cx="-2" cy="8" r="4" fill="#C0562E" />
            </g>
          );
        })}
      </g>

      {/* Ön tepe (en yakın, açık toprak/yeşil) */}
      <path d="M0 480 Q 240 430 500 470 Q 760 510 1000 465 Q 1120 445 1200 465 V600 H0 Z" fill="#5b7a4a" />

      {/* Ön sıradaki büyük kahve fideleri */}
      <g>
        {[80, 200, 340, 730, 880, 1010, 1130].map((x, i) => {
          const y = 505 + (i % 2) * 10;
          return (
            <g key={`front-${x}`} transform={`translate(${x},${y})`}>
              <ellipse cx="0" cy="0" rx="38" ry="30" fill="#4A7A3D" />
              <ellipse cx="0" cy="-6" rx="30" ry="22" fill="#5b8a4d" />
              <circle cx="-12" cy="-8" r="6" fill="#C0562E" />
              <circle cx="10" cy="-4" r="6" fill="#8a2d1f" />
              <circle cx="-4" cy="10" r="6" fill="#C0562E" />
              <circle cx="14" cy="12" r="6" fill="#8a2d1f" />
            </g>
          );
        })}
      </g>

      {/* Çiftçi figürü 1 — çekirdek topluyor */}
      <g transform="translate(470,470)">
        <ellipse cx="0" cy="86" rx="22" ry="6" fill="#241B14" opacity="0.12" />
        <rect x="-14" y="20" width="28" height="46" rx="10" fill="#C0562E" />
        <circle cx="0" cy="6" r="16" fill="#8A7D6C" />
        <rect x="-16" y="14" width="32" height="12" rx="6" fill="#241B14" />
        <rect x="-9" y="60" width="8" height="26" rx="4" fill="#241B14" />
        <rect x="4" y="60" width="8" height="26" rx="4" fill="#241B14" />
        <path d="M12 34 Q34 30 34 52" stroke="#8A7D6C" strokeWidth="8" strokeLinecap="round" fill="none" />
        <g transform="translate(40,54)">
          <path d="M-14 0 Q0 -10 14 0 L11 18 Q0 24 -11 18 Z" fill="#D97A4E" stroke="#241B14" strokeWidth="2" />
          <circle cx="-4" cy="8" r="3" fill="#8a2d1f" />
          <circle cx="5" cy="6" r="3" fill="#C0562E" />
          <circle cx="0" cy="14" r="3" fill="#8a2d1f" />
        </g>
      </g>

      {/* Çiftçi figürü 2 — sepetle yürüyor */}
      <g transform="translate(770,480)">
        <ellipse cx="0" cy="80" rx="20" ry="6" fill="#241B14" opacity="0.12" />
        <rect x="-13" y="16" width="26" height="42" rx="10" fill="#3d6b4f" />
        <circle cx="0" cy="2" r="15" fill="#8A7D6C" />
        <path d="M-15 -2 Q0 -20 15 -2 Q15 6 0 6 Q-15 6 -15 -2 Z" fill="#241B14" />
        <rect x="-9" y="54" width="8" height="24" rx="4" fill="#241B14" />
        <rect x="3" y="54" width="8" height="24" rx="4" fill="#241B14" />
        <g transform="translate(-30,44)">
          <path d="M-13 0 Q0 -9 13 0 L10 16 Q0 21 -10 16 Z" fill="#D97A4E" stroke="#241B14" strokeWidth="2" />
          <circle cx="-3" cy="7" r="2.5" fill="#8a2d1f" />
          <circle cx="4" cy="5" r="2.5" fill="#C0562E" />
        </g>
      </g>
    </svg>
  );
}
