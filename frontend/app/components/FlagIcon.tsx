import { countryCode } from "../../lib/countryFlags";

/** Gerçek SVG bayrak (flag-icons paketi) — emoji bayrak yerine, tüm platformlarda tutarlı görünür. */
export default function FlagIcon({
  country,
  className = "",
}: {
  country: string | null | undefined;
  className?: string;
}) {
  const code = countryCode(country);
  if (!code) return null;
  return <span className={`fi fi-${code} ${className}`} aria-hidden="true" />;
}
