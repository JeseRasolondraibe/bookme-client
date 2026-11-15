// "15 €", "35,50 €" : jamais "35.5 €" (SRV-01 du cahier de tests).
export function formatPrice(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  const opts = Number.isInteger(v) ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${v.toLocaleString("fr-FR", opts)} €`;
}
