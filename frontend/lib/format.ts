/** Binlik ayraçlı sayı gösterimi (fiyat/tutar alanları için). */
export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}
