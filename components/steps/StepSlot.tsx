"use client";
import { useState, useEffect } from "react";
import { Presta, Service } from "../BookingFlow";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://flrtdhzcimbkbcgczmea.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const DAYS   = ["L","M","M","J","V","S","D"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

type DayStatus = "available" | "full" | "closed" | "past" | "loading" | "unknown";

async function fetchDayStatus(slug: string, serviceId: string, date: string): Promise<DayStatus> {
  try {
    const r = await fetch(
      `${SUPABASE_URL}/functions/v1/slots?slug=${slug}&service_id=${serviceId}&date=${date}`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const d = await r.json();
    if (!d.open) return "closed";
    if (Array.isArray(d.slots) && d.slots.length > 0) return "available";
    return "full";
  } catch { return "unknown"; }
}

export default function StepSlot({ presta, service, selected, onSelect, onBack }: {
  presta: Presta; service: Service;
  selected: { date?: string; time?: string };
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}) {
  const today = new Date();
  const [year,        setYear]        = useState(today.getFullYear());
  const [month,       setMonth]       = useState(today.getMonth());
  const [date,        setDate]        = useState<string | null>(selected.date ?? null);
  const [time,        setTime]        = useState<string | null>(selected.time ?? null);
  const [slots,       setSlots]       = useState<string[]>([]);
  const [loadSlots,   setLoadSlots]   = useState(false);
  const [dayStatus,   setDayStatus]   = useState<Record<string, DayStatus>>({});
  const [loadingMonth,setLoadingMonth]= useState(false);

  const todayStr  = toISO(today.getFullYear(), today.getMonth(), today.getDate());
  const daysCount = new Date(year, month + 1, 0).getDate();
  const firstDay  = (new Date(year, month, 1).getDay() + 6) % 7;

  useEffect(() => {
    setDayStatus({});
    setDate(null);
    setTime(null);
    setSlots([]);
    setLoadingMonth(true);

    const futureDays: string[] = [];
    for (let d = 1; d <= daysCount; d++) {
      const iso = toISO(year, month, d);
      if (iso >= todayStr) futureDays.push(iso);
    }

    Promise.all(
      futureDays.map(iso => fetchDayStatus(presta.slug, service.id, iso).then(status => ({ iso, status })))
    ).then(results => {
      const map: Record<string, DayStatus> = {};
      results.forEach(({ iso, status }) => { map[iso] = status; });
      setDayStatus(map);
    }).finally(() => setLoadingMonth(false));
  }, [year, month]);

  useEffect(() => {
    if (!date) return;
    setLoadSlots(true); setSlots([]); setTime(null);
    fetch(`${SUPABASE_URL}/functions/v1/slots?slug=${presta.slug}&service_id=${service.id}&date=${date}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    })
      .then(r => r.json()).then(d => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadSlots(false));
  }, [date]);

  const prevMonth = () => month === 0 ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1);
  const nextMonth = () => month === 11 ? (setMonth(0), setYear(y => y+1)) : setMonth(m => m+1);

  function getDayStyle(iso: string, isSel: boolean) {
    const status = dayStatus[iso] as DayStatus | undefined;
    if (isSel) return "bg-violet-500 text-white font-semibold";
    if (!status || status === "loading") return "text-stone-300 animate-pulse";
    if (status === "available") return "hover:bg-green-50 text-stone-700 cursor-pointer";
    if (status === "full")   return "text-orange-400 cursor-default";
    if (status === "closed") return "text-stone-300 cursor-default";
    return "text-stone-300 cursor-default";
  }

  function getDayIndicator(iso: string, isSel: boolean) {
    const status = dayStatus[iso] as DayStatus | undefined;
    if (!status || status === "loading" || status === "past" || status === "unknown") return null;
    if (isSel) return <span className="text-[7px] text-white">●</span>;
    if (status === "available") return <span className="text-[7px] text-green-500">●</span>;
    if (status === "full")      return <span className="text-[7px] text-orange-400">●</span>;
    if (status === "closed")    return <span className="text-[7px] text-red-400">✕</span>;
    return null;
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-700 text-sm">← Retour</button>
        <span className="ml-auto text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-lg font-medium">
          {service.name} · {service.price} €
        </span>
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
            const day    = i + 1;
            const iso    = toISO(year, month, day);
            const isPast = iso < todayStr;
            const isSel  = iso === date;
            const status = dayStatus[iso] as DayStatus | undefined;
            const clickable = !isPast && status === "available";

            return (
              <button key={day}
                disabled={!clickable}
                onClick={() => clickable && setDate(iso)}
                className={`h-10 w-full text-xs rounded-lg transition-colors flex flex-col items-center justify-center gap-0.5
                  ${isPast ? "text-stone-200 cursor-default" : getDayStyle(iso, isSel)}`}>
                <span>{day}</span>
                {!isPast && getDayIndicator(iso, isSel)}
              </button>
            );
          })}
        </div>

        {loadingMonth && (
          <p className="text-center text-xs text-stone-400 mt-2">Chargement des disponibilités...</p>
        )}

        {/* Légende */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <span className="text-green-500 text-xs">●</span>
            <span className="text-xs text-stone-400">Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-orange-400 text-xs">●</span>
            <span className="text-xs text-stone-400">Complet</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-400 text-xs">✕</span>
            <span className="text-xs text-stone-400">Fermé</span>
          </div>
        </div>
      </div>

      {date && (
        <div>
          <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">Créneaux disponibles</p>
          {loadSlots && <p className="text-sm text-stone-400">Chargement...</p>}
          {!loadSlots && slots.length === 0 && <p className="text-sm text-stone-400">Aucun créneau ce jour. Essaie une autre date.</p>}
          {!loadSlots && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {slots.map(s => (
                <button key={s} onClick={() => setTime(s)}
                  className={`py-2.5 text-sm rounded-xl border transition-all
                    ${time === s
                      ? "border-violet-500 bg-violet-50 text-violet-700 font-medium ring-1 ring-violet-300"
                      : "border-stone-200 bg-white text-stone-700 hover:border-violet-300"}`}>
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
