"use client";
import { Service, ServiceOption } from "../BookingFlow";
import { ClockIcon, TagIcon } from "../icons";
import { formatDuration } from "@/lib/duration";
import { formatPrice } from "@/lib/price";

// La sélection ne fait plus avancer le flow toute seule : le client valide via
// le bouton « Continuer » du récapitulatif, ce qui lui laisse le temps de comparer.
export default function StepService({ services, selected, selectedOptions, onSelect, onOptionsChange }: {
  services: Service[];
  selected?: Service;
  selectedOptions: ServiceOption[];
  onSelect: (s: Service) => void;
  onOptionsChange: (o: ServiceOption[]) => void;
}) {
  const toggle = (o: ServiceOption) => {
    const has = selectedOptions.some(x => x.id === o.id);
    const next = has ? selectedOptions.filter(x => x.id !== o.id) : [...selectedOptions, o];
    onOptionsChange(next.sort((a, b) => a.position - b.position));
  };
  return (
    <section>

      {services.length === 0 && (
        <p className="text-sm text-stone-400">Aucune prestation disponible pour le moment.</p>
      )}

      <div className="flex flex-col gap-3">
        {services.map(s => {
          const isSel = selected?.id === s.id;
          const opts = s.options ?? [];
          return (
            <div key={s.id} className="flex flex-col gap-2">
            <button onClick={() => onSelect(s)} aria-pressed={isSel}
              className={`w-full flex items-center justify-between gap-4 px-4 py-4 rounded-xl border text-left transition-all active:scale-[0.99]
                ${isSel ? "border-accent-600 bg-accent-50 ring-1 ring-accent-400" : "border-stone-200 bg-surface hover:border-accent-400"}`}>
              <div className="flex items-center gap-3 min-w-0">
                {s.photo_url && (
                  <img
                    src={s.photo_url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-stone-900">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-stone-400 mt-0.5 truncate">{s.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-stone-500">
                      <ClockIcon className="w-3.5 h-3.5 text-stone-400" />
                      {formatDuration(s.duration_min)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-stone-500">
                      <TagIcon className="w-3.5 h-3.5 text-stone-400" />
                      {formatPrice(s.price)}
                    </span>
                    {s.has_price_rules && <span className="text-xs text-stone-500">Prix selon le créneau</span>}
                  </div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${isSel ? "border-accent-600 bg-accent-600" : "border-stone-300"}`}>
                {isSel && <div className="w-1.5 h-1.5 rounded-full bg-on-accent" />}
              </div>
            </button>
            {/* Options : visibles une fois la prestation choisie, plusieurs cochables. */}
            {isSel && opts.length > 0 && (
              <fieldset className="ml-2 sm:ml-4 pl-3 border-l-2 border-accent-400 flex flex-col gap-1.5">
                <legend className="text-xs font-medium text-stone-500 mb-1">Options (facultatif)</legend>
                {opts.map(o => {
                  const on = selectedOptions.some(x => x.id === o.id);
                  return (
                    <label key={o.id}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors
                        ${on ? "border-accent-600 bg-accent-50" : "border-stone-200 bg-surface hover:border-accent-400"}`}>
                      <span className="flex items-center gap-2.5 min-w-0">
                        <input type="checkbox" checked={on} onChange={() => toggle(o)}
                          className="w-4 h-4 shrink-0 accent-[var(--color-accent-600)]" />
                        <span className="text-sm font-medium text-stone-900 truncate">{o.name}</span>
                      </span>
                      <span className="text-xs font-medium text-stone-500 shrink-0">
                        {Number(o.price) > 0 ? `+ ${formatPrice(o.price)}` : "Inclus"}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
