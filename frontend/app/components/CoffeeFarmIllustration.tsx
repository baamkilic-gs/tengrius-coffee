/**
 * Elle çizilmiş düz-vektör ("corporate memphis") kahve tarlası sahnesi — hero arka planı.
 * AI görsel üretimi bu oturumda kredisiz kaldığı için SVG olarak kodlandı; tüm renkler
 * marka paletiyle (terracotta/koyu kahve/krem/yeşil) birebir eşleşiyor.
 *
 * v2: insan figürleri kaldırıldı (en zayıf halka), güneş küçültülüp köşeye çekildi,
 * çalılar üst üste daire kümeleriyle daha "çalı" gibi, sol-alt (kart bölgesi) sade bırakıldı.
 */
export default function CoffeeFarmIllustration({ className = "" }: { className?: string }) {
  const bush = (x: number, y: number, scale: number, leaf: string, leafDark: string) => (
    <g key={`${x}-${y}`} transform={`translate(${x},${y}) scale(${scale})`}>
      <ellipse cx="-16" cy="4" rx="20" ry="16" fill={leafDark} />
      <ellipse cx="16" cy="4" rx="20" ry="16" fill={leafDark} />
      <ellipse cx="0" cy="-10" rx="24" ry="19" fill={leaf} />
      <circle cx="-9" cy="-10" r="4.5" fill="#C0562E" />
      <circle cx="8" cy="-4" r="4.5" fill="#7a2418" />
      <circle cx="-2" cy="4" r="4.5" fill="#C0562E" />
    </g>
  );

  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7F4EE" />
          <stop offset="100%" stopColor="#F1E9DC" />
        </linearGradient>
      </defs>

      {/* Gökyüzü */}
      <rect x="0" y="0" width="1200" height="600" fill="url(#sky)" />

      {/* Güneş + ışınlar — köşeye çekilmiş, küçük ve sakin */}
      <g transform="translate(1080,86) scale(0.62)">
        <g stroke="#D97A4E" strokeWidth="7" strokeLinecap="round" opacity="0.85">
          <line x1="0" y1="-88" x2="0" y2="-66" />
          <line x1="-88" y1="0" x2="-66" y2="0" />
          <line x1="-62" y1="-62" x2="-47" y2="-47" />
          <line x1="-62" y1="62" x2="-47" y2="47" />
        </g>
        <circle r="48" fill="#D97A4E" />
      </g>

      {/* Bulutlar — kenarlarda, sakin */}
      <g fill="#FFFFFF" opacity="0.9">
        <g transform="translate(150,110)">
          <ellipse cx="0" cy="8" rx="42" ry="18" />
          <ellipse cx="30" cy="-2" rx="28" ry="22" />
        </g>
        <g transform="translate(770,70)">
          <ellipse cx="0" cy="6" rx="30" ry="14" />
          <ellipse cx="20" cy="-2" rx="20" ry="16" />
        </g>
      </g>

      {/* Pırıltı aksanları — sade, güneşin etrafında */}
      <g fill="#C0562E" opacity="0.55">
        <path d="M960 220 l4 11 11 4 -11 4 -4 11 -4 -11 -11 -4 11 -4z" />
        <path d="M270 220 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" />
      </g>

      {/* Arka tepe (uzak, soluk) */}
      <path d="M0 400 Q 220 350 460 392 Q 760 434 1000 386 Q 1120 364 1200 388 V600 H0 Z" fill="#4A7A3D" opacity="0.35" />

      {/* Orta tepe */}
      <path d="M0 450 Q 200 404 440 440 Q 720 480 960 428 Q 1080 404 1200 430 V600 H0 Z" fill="#4A7A3D" opacity="0.65" />

      {/* Orta sıradaki küçük çalılar (sol-alt kart bölgesi bilerek boş bırakıldı) */}
      <g opacity="0.9">
        {[560, 660, 760, 860, 960, 1060].map((x, i) => bush(x, 466 + (i % 2) * 10, 0.62, "#5b8a4d", "#3d6b4f"))}
      </g>

      {/* Ön tepe (en yakın) */}
      <path d="M0 486 Q 260 448 540 478 Q 800 508 1020 470 Q 1130 452 1200 470 V600 H0 Z" fill="#4A7A3D" />

      {/* Ön sıradaki büyük çalılar — yoğunluk sağda/ortada, kartın oturacağı sol-alt sade */}
      <g>
        {[430, 540, 650, 760, 880, 1000, 1110].map((x, i) => bush(x, 522 + (i % 2) * 12, 0.95, "#6b9a58", "#4A7A3D"))}
      </g>
    </svg>
  );
}
