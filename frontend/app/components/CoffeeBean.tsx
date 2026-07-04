export default function CoffeeBean({
  className = "",
  size = 120,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 200 260"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="beanBody" cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#8a5a3a" />
          <stop offset="35%" stopColor="#5a3420" />
          <stop offset="75%" stopColor="#3b2417" />
          <stop offset="100%" stopColor="#241309" />
        </radialGradient>
        <linearGradient id="beanCrease" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#160b04" />
          <stop offset="50%" stopColor="#3b2417" />
          <stop offset="100%" stopColor="#160b04" />
        </linearGradient>
        <radialGradient id="beanShine" cx="30%" cy="20%" r="35%">
          <stop offset="0%" stopColor="#e0b968" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e0b968" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Gövde */}
      <path
        d="M100 10
           C 150 10 185 55 185 130
           C 185 205 150 250 100 250
           C 50 250 15 205 15 130
           C 15 55 50 10 100 10 Z"
        fill="url(#beanBody)"
      />

      {/* Parlama */}
      <ellipse cx="70" cy="70" rx="45" ry="55" fill="url(#beanShine)" />

      {/* Orta çentik */}
      <path
        d="M100 25
           C 90 55 112 75 98 105
           C 86 133 114 150 100 178
           C 90 203 112 220 100 240"
        stroke="url(#beanCrease)"
        strokeWidth="13"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M100 25
           C 90 55 112 75 98 105
           C 86 133 114 150 100 178
           C 90 203 112 220 100 240"
        stroke="#000"
        strokeOpacity="0.35"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
