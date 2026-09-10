"use client";
import { Service } from "../BookingFlow";
import { ClockIcon, TagIcon } from "../icons";

// La sélection ne fait plus avancer le flow toute seule : le client valide via
// le bouton « Continuer » du récapitulatif, ce qui lui laisse le temps de comparer.
export default function StepService({ services, selected, onSelect }: {
  services: Service[];
  selected?: Service;
  onSelect: (s: Service) => void;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-stone-900 mb-5">1. Choisissez une prestation</h2>

      {services.length === 0 && (
        <p className="text-sm text-stone-400">Aucune prestation disponible pour le moment.</p>
      )}

      <div className="flex flex-col gap-3">
        {services.map(s => {
          const isSel = selected?.id === s.id;
          return (
            <button key={s.id} onClick={() => onSelect(s)} aria-pressed={isSel}
              className={`w-full flex items-center justify-between gap-4 px-4 py-4 rounded-xl border text-left transition-all active:scale-[0.99]
                ${isSel ? "border-accent-600 bg-accent-50 ring-1 ring-accent-400" : "border-stone-200 bg-white hover:border-accent-400"}`}>
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
                      {s.duration_min} min
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-stone-500">
                      <TagIcon className="w-3.5 h-3.5 text-stone-400" />
                      {s.price} €
                    </span>
                  </div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${isSel ? "border-accent-600 bg-accent-600" : "border-stone-300"}`}>
                {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
