export default function TengriusLogo({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Tengrius güneşi: çekirdek disk + 8 ışın (tengrius-landing ile aynı marka işareti) */}
      <circle cx="20" cy="20" r="7" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <line x1="20" y1="2.5" x2="20" y2="9" />
        <line x1="20" y1="31" x2="20" y2="37.5" />
        <line x1="2.5" y1="20" x2="9" y2="20" />
        <line x1="31" y1="20" x2="37.5" y2="20" />
        <line x1="7.6" y1="7.6" x2="12.2" y2="12.2" />
        <line x1="27.8" y1="27.8" x2="32.4" y2="32.4" />
        <line x1="7.6" y1="32.4" x2="12.2" y2="27.8" />
        <line x1="27.8" y1="12.2" x2="32.4" y2="7.6" />
      </g>
    </svg>
  );
}
