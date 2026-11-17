// Même calcul que supabase/functions/_shared/deposits.ts (à garder aligné).
// Le serveur recalcule toujours : ceci ne sert qu'à l'affichage.
export function depositAmount(rule: { deposit_type?: string | null; deposit_value?: number | string | null }, total: number): number {
  const value = Number(rule.deposit_value ?? 0);
  if (!(value > 0) || !(total > 0)) return 0;
  let amount = 0;
  if (rule.deposit_type === "fixed") amount = value;
  else if (rule.deposit_type === "percent") amount = (total * Math.min(value, 100)) / 100;
  amount = Math.round(Math.min(amount, total) * 100) / 100;
  return amount >= 0.5 ? amount : 0;
}

export function refundDelayLabel(hours: number): string {
  if (hours <= 0) return "jusqu'à l'heure du rendez-vous";
  if (hours % 24 === 0) return `jusqu'à ${hours / 24} jour${hours > 24 ? "s" : ""} avant le rendez-vous`;
  return `jusqu'à ${hours} h avant le rendez-vous`;
}
