/**
 * Prisma Decimal alanları JSON.stringify ile obje olarak kalır (ör. {"s":1,"e":1,"d":[12]});
 * API yanıtlarında düz sayıya çevrilir.
 */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

/** Bir objedeki verilen alan adlarını Decimal'den number'a çevirir (yeni obje döner). */
export function decimalFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
): T {
  const result: any = { ...obj };
  for (const field of fields) {
    if (result[field] !== undefined) {
      result[field] = toNumber(result[field]);
    }
  }
  return result;
}
