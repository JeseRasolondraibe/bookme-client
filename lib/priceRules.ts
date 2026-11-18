// Même calcul que supabase/functions/_shared/price_rules.ts (applyRules, à
// garder aligné). Le serveur dit quelles règles s'appliquent à chaque créneau
// (slot_rules) ; on applique ici leur effet au total prestation + options.
// Affichage seulement : bookings recalcule et fige le prix.

export type PriceRuleEffect = { id: string; name: string; direction: "up" | "down"; effect_type: "percent" | "fixed"; effect_value: number };
export type Adjustment = { name: string; amount: number };

// Plafond sur l'ensemble des règles cumulées : +100 % / −50 %.
const MAX_UP = 1;
const MAX_DOWN = 0.5;
const ROUND_STEP = 0.5;
const r2 = (n: number) => Math.round(n * 100) / 100;

export function applyRules(base: number, rules: PriceRuleEffect[]): { price: number; adjustments: Adjustment[] } {
  if (rules.length === 0 || base <= 0) return { price: r2(base), adjustments: [] };
  const adjustments = rules.map(r => {
    const v = Math.max(0, Number(r.effect_value) || 0);
    const raw = r.effect_type === "percent" ? base * v / 100 : v;
    return { name: r.name, amount: r2(r.direction === "down" ? -raw : raw) };
  });
  const shift = adjustments.reduce((t, a) => t + a.amount, 0);
  const capped = Math.max(-base * MAX_DOWN, Math.min(base * MAX_UP, shift));
  const price = r2(Math.max(0.5, Math.round((base + capped) / ROUND_STEP) * ROUND_STEP));
  const diff = r2(price - base - shift);
  if (diff !== 0) adjustments.push({ name: Math.abs(capped) < Math.abs(shift) ? "Plafond" : "Arrondi", amount: diff });
  return { price, adjustments };
}

/** Code promo (lien de campagne ou saisi), revalidé par bookings. */
export type Promo = { code: string; percent: number; valid_date?: string | null; valid_times?: string[] | null; manual?: boolean };
export function promoApplies(p: Promo | null | undefined, date?: string, time?: string): boolean {
  if (!p) return false;
  if (p.valid_date && p.valid_date !== date) return false;
  if (p.valid_times?.length && (!time || !p.valid_times.includes(time))) return false;
  return true;
}
export const promoEffect = (p: Promo): PriceRuleEffect =>
  ({ id: "promo", name: `Code ${p.code}`, direction: "down", effect_type: "percent", effect_value: p.percent });

export function priceForSlot(base: number, all: PriceRuleEffect[], ids: string[] | undefined) {
  return applyRules(base, ids?.length ? all.filter(r => ids.includes(r.id)) : []);
}
