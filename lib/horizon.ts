const DEFAULT_HORIZON_MONTHS = 3;

export type HorizonFields = {
  booking_horizon_months?: number | null;
  booking_horizon_date?: string | null;
};

export function resolveHorizonDate(presta: HorizonFields, todayStr: string): string {
  const fixed = presta.booking_horizon_date;
  if (fixed && fixed >= todayStr) return fixed;

  const months = presta.booking_horizon_months ?? DEFAULT_HORIZON_MONTHS;
  const [y, m, d] = todayStr.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, d));
  if (target.getUTCDate() !== d) target.setUTCDate(0);
  return target.toISOString().slice(0, 10);
}

export function formatHorizonLabel(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}
