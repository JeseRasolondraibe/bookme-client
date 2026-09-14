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
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, cache: "no-store" }
    );
    const d = await r.json();
    if (!d.open) return "closed";
    if (Array.isArray(d.slots) && d.slots.length > 0) return "available";
    return "full";
  } catch { return "unknown"; }
}

function SlotButton({ slot, selected, onSelect }: { slot: string; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className={`py-2.5 text-sm rounded-xl border transition-all active:scale-[0.98]
        ${selected
          ? "border-accent-600 bg-accent-50 text-accent-600 font-medium ring-1 ring-accent-400"
          : "border-stone-200 bg-white text-stone-700 hover:border-accent-400"}`}>
      {slot}
    </button>
  );
}

export default function StepSlot({ presta, service, selected, onSelect, onBack }: {
  presta: Presta; service: Service;
  selected: { date?: string; time?: string };
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
}) {
  const today = new Date();
  const [year,         setYear]         = useState(today.getFullYear());
  const [month,        setMonth]        = useState(today.getMonth());
  const [date,         setDate]         = useState<string | null>(selected.date ?? null);
  const [time,         setTime]         = useState<string | null>(selected.time ?? null);
  const [slots,        setSlots]        = useState<string[]>([]);
  const [loadSlots,    setLoadSlots]    = useState(false);
  const [dayStatus,    setDayStatus]    = useState<Record<string, DayStatus>>({});
  const [loadingMonth, setLoadingMonth] = useState(false);

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
    fetch(
      `${SUPABASE_URL}/functions/v1/slots?slug=${presta.slug}&service_id=${service.id}&date=${date}`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, cache: "no-store" }
    )
      .then(r => r.json()).then(d => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadSlots(false));
  }, [date]);

  const prevMonth = () => month === 0 ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1);
  const nextMonth = () => month === 11 ? (setMonth(0), setYear(y => y+1)) : setMonth(m => m+1);

  // Regroupement purement présentationnel des créneaux déjà chargés (aucun appel réseau ici).
  const morningSlots   = slots.filter(s => parseInt(s.slice(0, 2), 10) < 12);
  const afternoonSlots = slots.filter(s => parseInt(s.slice(0, 2), 10) >= 12);

  // La disponibilité est portée par le FOND de la case, pas par une pastille
  // sous le chiffre : plus lisible d'un coup d'oeil, et la case redevient une
  // simple ligne (le calendrier perd ~30% de hauteur au passage).
  function getDayStyle(iso: string, isSel: boolean) {
    const status = dayStatus[iso] as DayStatus | undefined;
    if (isSel) return "bg-accent-600 text-white font-semibold shadow-sm";
    if (!status || status === "loading") return "bg-stone-50 text-stone-300 animate-pulse";
    if (status === "available") return "bg-green-100 text-green-800 font-medium hover:bg-green-200 cursor-pointer";
    if (status === "full")      return "bg-orange-100 text-orange-700 cursor-default";
    if (status === "closed")    return "bg-stone-100 text-stone-400 cursor-default";
    return "bg-stone-50 text-stone-300 cursor-default";
  }

  // Le fond coloré seul ne suffit pas (daltonisme, impression N&B) : chaque
  // case porte aussi son statut en texte, lu par les lecteurs d'écran et
  // affiché au survol.
  function getDayTitle(iso: string) {
    const status = dayStatus[iso] as DayStatus | undefined;
    if (status === "available") return "Disponible";
    if (status === "full")      return "Complet";
    if (status === "closed")    return "Fermé";
    return "";
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-700 text-sm">← Retour</button>
        <span className="ml-auto text-xs bg-accent-50 text-accent-600 px-2 py-1 rounded-lg font-medium">
          {service.name} · {service.price} €
        </span>
      </div>

      {/* Calendrier et créneaux côte à côte à partir de md : sur mobile la
          colonne unique reprend l'empilement d'origine. */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="text-stone-400 hover:text-stone-700 px-1 text-lg">‹</button>
            <span className="text-sm font-semibold text-stone-900">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="text-stone-400 hover:text-stone-700 px-1 text-lg">›</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d, i) => <div key={i} className="text-center text-xs text-stone-400 py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
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
                  title={isPast ? "" : getDayTitle(iso)}
                  aria-label={`${day} ${MONTHS[month]}${isPast ? "" : ` — ${getDayTitle(iso)}`}`}
                  className={`aspect-square w-full text-sm rounded-lg transition-colors flex items-center justify-center
                    ${isPast ? "text-stone-200 cursor-default" : getDayStyle(iso, isSel)}`}>
                  {day}
                </button>
              );
            })}
          </div>

          {loadingMonth && (
            <p className="text-center text-xs text-stone-400 mt-2">Chargement des disponibilités...</p>
          )}

          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-green-100 border border-green-200" />
              <span className="text-xs text-stone-500">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-orange-100 border border-orange-200" />
              <span className="text-xs text-stone-500">Complet</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-stone-100 border border-stone-200" />
              <span className="text-xs text-stone-500">Fermé</span>
            </div>
          </div>
        </div>

        {/* Colonne créneaux. Sur mobile elle n'apparaît qu'une fois une date
            choisie ; sur desktop elle garde sa place avec un message d'invite,
            pour que le calendrier ne se déplace pas au moment du clic. */}
        <div className={`${date ? "block" : "hidden md:block"} bg-white rounded-xl border border-stone-200 p-4 md:max-h-[420px] md:overflow-y-auto`}>
          {!date && (
            <p className="text-sm text-stone-400 text-center py-10">
              Choisis une date pour voir les créneaux disponibles.
            </p>
          )}
          {date && (
            <div className="flex flex-col gap-4">
              {loadSlots && <p className="text-sm text-stone-400">Chargement...</p>}
              {!loadSlots && slots.length === 0 && <p className="text-sm text-stone-400">Aucun créneau ce jour. Essaie une autre date.</p>}
              {!loadSlots && morningSlots.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">Matin</p>
                  <div className="grid grid-cols-3 gap-2">
                    {morningSlots.map(s => (
                      <SlotButton key={s} slot={s} selected={time === s} onSelect={() => setTime(s)} />
                    ))}
                  </div>
                </div>
              )}
              {!loadSlots && afternoonSlots.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">Après-midi</p>
                  <div className="grid grid-cols-3 gap-2">
                    {afternoonSlots.map(s => (
                      <SlotButton key={s} slot={s} selected={time === s} onSelect={() => setTime(s)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {date && time && (
        <button onClick={() => onSelect(date, time)}
          className="mt-6 w-full bg-accent-600 hover:bg-accent-700 text-white font-medium py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98]">
          Confirmer ce créneau →
        </button>
      )}
    </section>
  );
}
