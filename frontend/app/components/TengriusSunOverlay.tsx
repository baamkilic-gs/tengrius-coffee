/**
 * Tengrius güneşi — hero arka plan fotoğrafının üzerine bindirilen küçük SVG.
 * Mouse hero'nun üzerine gelince ışınlar döner (bkz. globals.css .hero-scene:hover .sun-rays).
 */
export default function TengriusSunOverlay({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="-100 -100 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g className="sun-rays" stroke="#D97A4E" strokeWidth="7" strokeLinecap="round" opacity="0.9">
        <line x1="0" y1="-92" x2="0" y2="-70" />
        <line x1="0" y1="70" x2="0" y2="92" />
        <line x1="-92" y1="0" x2="-70" y2="0" />
        <line x1="70" y1="0" x2="92" y2="0" />
        <line x1="-65" y1="-65" x2="-49" y2="-49" />
        <line x1="49" y1="49" x2="65" y2="65" />
        <line x1="-65" y1="65" x2="-49" y2="49" />
        <line x1="49" y1="-49" x2="65" y2="-65" />
      </g>
      <circle r="48" fill="#D97A4E" />
    </svg>
  );
}
