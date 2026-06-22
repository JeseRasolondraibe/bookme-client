"use client";
import { Service } from "../BookingFlow";

export default function StepService({ services, selected, onSelect }: {
  services: Service[];
  selected?: Service;
  onSelect: (s: Service) => void;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-stone-900 mb-4">Choisir une prestation</h2>
      <div className="flex flex-col gap-3">
        {services.map(s => (
          <button key={s.id} onClick={() => onSelect(s)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all
              ${selected?.id === s.id ? "border-violet-500 bg-violet-50 ring-1 ring-violet-300" : "border-stone-200 bg-white hover:border-violet-300"}`}>
            <div>
              <p className="text-sm font-medium text-stone-900">{s.name}</p>
              <p className="text-xs text-stone-400 mt-0.5">{s.duration_min} min</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-stone-900">{s.price} €</span>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selected?.id === s.id ? "border-violet-500 bg-violet-500" : "border-stone-300"}`}>
                {selected?.id === s.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
