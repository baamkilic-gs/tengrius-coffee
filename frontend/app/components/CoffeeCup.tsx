export default function CoffeeCup({
  className = "",
  size = 140,
  showSteam = true,
  accent,
}: {
  className?: string;
  size?: number;
  showSteam?: boolean;
  accent?: string;
}) {
  const rim = accent ?? "#d8c9ae";

  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cupBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ece2d3" />
        </linearGradient>
        <radialGradient id="coffeeSurface" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#8a5a3a" />
          <stop offset="60%" stopColor="#5a3420" />
          <stop offset="100%" stopColor="#3b2417" />
        </radialGradient>
        <radialGradient id="saucerShade" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f6ecd9" />
          <stop offset="100%" stopColor="#e3d3b4" />
        </radialGradient>
      </defs>

      {/* Tabak */}
      <ellipse cx="100" cy="196" rx="88" ry="15" fill="url(#saucerShade)" />
      <ellipse cx="100" cy="196" rx="88" ry="15" fill="none" stroke="#d8c9ae" strokeWidth="1.5" opacity="0.6" />

      {/* Kulp */}
      <path
        d="M141 130 C 170 130 170 168 141 168"
        stroke={rim}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Govde */}
      <path d="M58 120 L142 120 L132 180 Q100 189 68 180 Z" fill="url(#cupBody)" />
      <path
        d="M58 120 L142 120 L132 180 Q100 189 68 180 Z"
        fill="none"
        stroke="#e3d3b4"
        strokeWidth="1.5"
      />

      {/* Fincan agzi */}
      <ellipse cx="100" cy="120" rx="42" ry="11" fill={rim} opacity="0.5" />

      {/* Kahve yuzeyi */}
      <ellipse cx="100" cy="121" rx="37" ry="8.5" fill="url(#coffeeSurface)" />
      <path
        d="M78 121 Q92 115 100 121 T124 121"
        stroke="#e0b968"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {showSteam && (
        <g strokeLinecap="round" fill="none" opacity="0.75">
          <path className="steam-1" d="M85 108 C 79 93 95 88 88 72" stroke="#c9b89a" strokeWidth="3.5" />
          <path className="steam-2" d="M107 106 C 101 90 117 86 110 68" stroke="#c9b89a" strokeWidth="3.5" />
        </g>
      )}
    </svg>
  );
}
