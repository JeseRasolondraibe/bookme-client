"use client";
import { useState, useEffect } from "react";
import { Presta, Service } from "../BookingFlow";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://flrtdhzcimbkbcgczmea.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const DAYS = ["L","M","M","J","V","S","D"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

export default function StepSlot({ presta, service, selected, onSelect, onBack }: {
  presta: Presta; service: Service;
  selected: { date?: string; time?: string };
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [date,  setDate]  = useState<string | null>(selected.date ?? null);
  const [time,  setTime]  = useState<string | null>(selected.time ?? null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const todayStr = toISO(today.getFullYear(), today.getMonth(), today.getDate());
  const daysCount = new Date(year, month + 1, 0).getDate();
  const firstDay  = (new Date(year, month, 1).getDay() + 6) % 7;

  useEffect(() => {
    if (!date) return;
    setLoading(true); setSlots([]); setTime(null);
    fetch(`${SUPABASE_URL}/functions/v1/slots?slug=${presta.slug}&service_id=${service.id}&date=${date}`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      }
    })
      .then(r => r.json()).then(d => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [date]);

  const prevMonth = () => month === 0 ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1);
  const nextMonth = () => month === 11 ? (setMonth(0), setYear(y => y+1)) : setMonth(m => m+1);

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-700 text-sm">← Retour</button>
        <span className="ml-auto text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-lg font-medium">{service.name} · {service.price} €</span>
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="text-stone-400 hover:text-stone-700 px-1 text-lg">‹</button>
          <span className="text-sm font-semibold text-stone-900">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="text-stone-400 hover:text-stone-700 px-1 text-lg">›</button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAYS.map((d, i) => <div key={i} className="text-center text-xs text-stone-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysCount }).map((_, i) => {
            const day = i + 1;
            const iso = toISO(year, month, day);
            const isPast = iso < todayStr;
            const isSel  = iso === date;
            return (
              <button key={day} disabled={isPast} onClick={() => setDate(iso)}
                className={`h-8 w-full text-xs rounded-lg transition-colors
                  ${isPast ? "text-stone-200 cursor-default" : ""}
                  ${isSel  ? "bg-violet-500 text-white font-semibold" : ""}
                  ${!isPast && !isSel ? "hover:bg-violet-50 text-stone-700" : ""}`}>
                {day}
              </button>
            );
          })}
        </div>
      </div>
      {date && (
        <div>
          <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">Créneaux disponibles</p>
          {loading && <p className="text-sm text-stone-400">Chargement...</p>}
          {!loading && slots.length === 0 && <p className="text-sm text-stone-400">Aucun créneau ce jour. Essaie une autre date.</p>}
          {!loading && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map(s => (
                <button key={s} onClick={() => setTime(s)}
                  className={`py-2.5 text-sm rounded-xl border transition-all
                    ${time === s ? "border-violet-500 bg-violet-50 text-violet-700 font-medium ring-1 ring-violet-300" : "border-stone-200 bg-white text-stone-700 hover:border-violet-300"}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {date && time && (
        <button onClick={() => onSelect(date, time)}
          className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3.5 rounded-xl transition-colors">
          Confirmer ce créneau →
        </button>
      )}
    </section>
  );
}
