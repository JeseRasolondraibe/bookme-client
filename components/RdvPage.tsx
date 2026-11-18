"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { themeOf, themeStyle, fontsHref } from "@/lib/themes";
import { formatPrice } from "@/lib/price";
import { formatDuration } from "@/lib/duration";
import { LocationIcon, PhoneIcon } from "./icons";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://flrtdhzcimbkbcgczmea.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const ENDPOINT = `${SUPABASE_URL}/functions/v1/rdv`;
const HEADERS = { "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` };
const POLL_MS = 8000;
const MAX_LEN = 1000;

type Message = { id: string; booking_id?: string; sender: "presta" | "client"; body: string; created_at: string };
type RdvData = {
  booking: {
    booked_at: string; status: string; service_name: string | null; duration_min: number | null;
    price: number | null; options: { name: string; price: number }[] | null;
    location_label: string | null; location_address: string | null; client_first_name: string | null;
  };
  presta: { name: string; slug: string; phone: string | null; avatar_url: string | null; city: string | null; theme: string | null } | null;
  messaging: { enabled: boolean; writable: boolean };
  messages: Message[];
  /** RDV du même client(e) chez cette presta : le fil est commun à tous. */
  bookings?: Record<string, { booked_at: string; service_name: string | null; status: string }>;
};

// booked_at = heure murale de Paris avec +00:00 de convenance : on affiche
// toujours en timeZone UTC, sans conversion (règle du projet).
function formatWhen(iso: string): string {
  const s = new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(iso: string): string {
  // created_at est un vrai horodatage : affiché à l'heure du navigateur.
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function icsHref(data: RdvData): string {
  const start = data.booking.booked_at.slice(0, 16).replace(/[-:]/g, "") + "00";
  const end = new Date(Date.parse(data.booking.booked_at) + (data.booking.duration_min ?? 60) * 60000).toISOString().slice(0, 16).replace(/[-:]/g, "") + "00";
  const esc = (v: string) => v.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const title = `${data.booking.service_name ?? "Rendez-vous"} – ${data.presta?.name ?? ""}`;
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Book Me Again//FR", "BEGIN:VEVENT",
    `UID:${start}-${data.presta?.slug ?? "rdv"}@bookmeagain.com`,
    `DTSTART;TZID=Europe/Paris:${start}`, `DTEND;TZID=Europe/Paris:${end}`,
    `SUMMARY:${esc(title)}`,
    ...(data.booking.location_address ? [`LOCATION:${esc(data.booking.location_address)}`] : []),
    "END:VEVENT", "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}

export default function RdvPage({ token }: { token: string }) {
  const [data, setData] = useState<RdvData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "invalid" | "error">("loading");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${ENDPOINT}?token=${encodeURIComponent(token)}`, { headers: HEADERS, cache: "no-store" });
      if (res.status === 404) { setState("invalid"); return; }
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
      setState("ready");
    } catch {
      setState(s => (s === "ready" ? s : "error"));
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // Rafraîchissement régulier tant que l'onglet est visible.
  useEffect(() => {
    if (state !== "ready" || !data?.messaging.enabled) return;
    const id = setInterval(() => { if (document.visibilityState === "visible") load(); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [state, data?.messaging.enabled, load]);

  useEffect(() => {
    const n = data?.messages.length ?? 0;
    if (n > lastCount.current) endRef.current?.scrollIntoView({ behavior: lastCount.current ? "smooth" : "auto", block: "end" });
    lastCount.current = n;
  }, [data?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true); setSendError(null);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { ...HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ token, body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setSendError(json.error ?? "Envoi impossible, réessayez."); return; }
      setDraft("");
      setData(d => (d ? { ...d, messages: [...d.messages, json.message] } : d));
    } catch {
      setSendError("Pas de connexion. Votre message n'est pas parti.");
    } finally {
      setSending(false);
    }
  }

  if (state === "loading") {
    return <main className="flex-1 flex items-center justify-center bg-stone-50 text-stone-500 text-sm">Chargement…</main>;
  }
  if (state !== "ready" || !data) {
    return (
      <main className="flex-1 flex items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 text-center">
          <h1 className="text-lg font-semibold text-stone-900">{state === "invalid" ? "Lien invalide" : "Page indisponible"}</h1>
          <p className="text-sm text-stone-600 mt-2">
            {state === "invalid"
              ? "Ce lien de rendez-vous n'existe pas ou n'est plus valable. Utilisez le lien reçu dans votre dernier email."
              : "Impossible de charger votre rendez-vous pour le moment. Réessayez dans un instant."}
          </p>
          {state === "error" && (
            <button type="button" onClick={() => { setState("loading"); load(); }} className="mt-5 px-5 py-3 rounded-xl bg-stone-900 text-white text-sm font-medium">Réessayer</button>
          )}
        </div>
      </main>
    );
  }

  const theme = themeOf(data.presta?.theme);
  const fonts = fontsHref(theme);
  const { booking, presta, messaging } = data;
  const cancelled = booking.status === "cancelled";
  const prestaName = presta?.name ?? "Votre prestataire";
  const mapsHref = booking.location_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.location_address)}` : null;
  const chatOn = messaging.enabled;

  // Récap replié par défaut quand la messagerie est active : la page sert
  // d'abord à échanger. Sans messagerie, le récap est tout le contenu.
  const details = (
    <div className="mt-3 pt-3 border-t border-stone-200 flex flex-col gap-2 text-sm">
      <p className="text-stone-700">
        {booking.service_name ?? "Rendez-vous"}{booking.duration_min ? ` · ${formatDuration(booking.duration_min)}` : ""}
        {booking.price != null && <span className="text-stone-500"> · {formatPrice(booking.price)}</span>}
      </p>
      {booking.options && booking.options.length > 0 && (
        <p className="text-stone-500">Options : {booking.options.map(o => o.name).join(", ")}</p>
      )}
      {booking.location_address && !cancelled && (
        <p className="text-stone-700">
          {booking.location_label && <span className="font-semibold text-stone-900">{booking.location_label} · </span>}
          {booking.location_address}
        </p>
      )}
      {!cancelled && (
        <div className="flex flex-wrap gap-2 mt-1">
          <a href={icsHref(data)} download="rendez-vous.ics" className="text-sm font-medium border border-stone-200 rounded-full px-3.5 py-2 text-stone-700 hover:bg-stone-50">Ajouter au calendrier</a>
          {mapsHref && <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="text-sm font-medium border border-stone-200 rounded-full px-3.5 py-2 text-stone-700 hover:bg-stone-50">Itinéraire</a>}
          {presta?.phone && <a href={`tel:${presta.phone}`} className="inline-flex items-center gap-1.5 text-sm font-medium border border-stone-200 rounded-full px-3.5 py-2 text-stone-700 hover:bg-stone-50"><PhoneIcon className="w-4 h-4" />Appeler</a>}
        </div>
      )}
      {cancelled && presta?.slug && (
        <a href={`/${presta.slug}`} className="mt-1 block text-center bg-accent-600 hover:bg-accent-700 text-on-accent font-medium py-3 rounded-xl">Reprendre rendez-vous</a>
      )}
    </div>
  );

  return (
    <>
      {fonts && <link rel="stylesheet" href={fonts} precedence="default" />}
      <main style={themeStyle(theme)} className={`bg-stone-50 ${chatOn ? "h-dvh flex flex-col" : "flex-1 px-4 py-6"}`}>
        <div className={`w-full max-w-xl mx-auto ${chatOn ? "flex-1 min-h-0 flex flex-col" : ""}`}>

          {/* En-tête compact : presta + rdv en une ligne, détails au toucher */}
          <header className={`bg-surface border-stone-200 ${chatOn ? "border-b sm:border sm:rounded-2xl sm:mt-4 px-4 py-3" : "border rounded-2xl p-4"}`}>
            <div className="flex items-center gap-3">
              {presta?.avatar_url
                ? <img src={presta.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover bg-stone-200 shrink-0" />
                : <div className="w-10 h-10 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center font-head font-semibold shrink-0" aria-hidden="true">{prestaName.charAt(0)}</div>}
              <div className="min-w-0 flex-1">
                <h1 className="font-head font-semibold text-stone-900 truncate">{prestaName}</h1>
                <p className={`text-sm truncate ${cancelled ? "text-red-700" : "text-stone-600"}`}>
                  {cancelled ? "Annulé · " : ""}<span className={cancelled ? "line-through" : ""}>{formatWhen(booking.booked_at)}</span>
                </p>
              </div>
              {chatOn && (
                <button type="button" onClick={() => setShowDetails(v => !v)} aria-expanded={showDetails}
                  className="shrink-0 text-sm font-medium text-accent-700 px-2 py-2">
                  {showDetails ? "Masquer" : "Détails"}
                </button>
              )}
            </div>
            {(!chatOn || showDetails) && details}
          </header>

          {chatOn && (
            <section className="flex-1 min-h-0 flex flex-col sm:mb-4 sm:mt-3 sm:bg-surface sm:border sm:border-stone-200 sm:rounded-2xl" aria-label={`Conversation avec ${prestaName}`}>
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-2" aria-live="polite">
                {data.messages.length === 0 && (
                  <p className="text-sm text-stone-500 text-center my-auto px-6">Une question avant votre rendez-vous ? Écrivez à {prestaName} ici. Vous recevrez sa réponse par email.</p>
                )}
                {data.messages.map((m, i) => {
                  const mine = m.sender === "client";
                  const prev = i > 0 ? data.messages[i - 1] : null;
                  const about = data.bookings && Object.keys(data.bookings).length > 1 && m.booking_id && (!prev || prev.booking_id !== m.booking_id)
                    ? data.bookings[m.booking_id] : null;
                  return (
                    <div key={m.id} className="contents">
                    {about && <p className="self-center text-[11px] font-medium text-stone-500 my-2">À propos du RDV {about.service_name ? `${about.service_name} · ` : ""}{formatWhen(about.booked_at)}</p>}
                    <div className={`flex flex-col max-w-[80%] ${mine ? "self-end items-end" : "self-start items-start"}`}>
                      <p className={`px-4 py-2.5 text-[15px] leading-snug whitespace-pre-wrap break-words ${mine ? "bg-accent-600 text-on-accent rounded-2xl rounded-br-md" : "bg-surface border border-stone-200 text-stone-900 rounded-2xl rounded-bl-md"}`}>{m.body}</p>
                      <span className="text-[11px] text-stone-500 mt-1 px-1">{mine ? "Vous" : prestaName} · {formatTime(m.created_at)}</span>
                    </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              {messaging.writable ? (
                <form onSubmit={send} className="bg-surface border-t border-stone-200 sm:rounded-b-2xl px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col gap-1.5">
                  <div className="flex gap-2 items-end">
                    <label htmlFor="msg" className="sr-only">Votre message</label>
                    <textarea id="msg" value={draft} onChange={e => setDraft(e.target.value.slice(0, MAX_LEN))} rows={1} maxLength={MAX_LEN}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !("ontouchstart" in window)) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }}
                      placeholder={`Écrire à ${prestaName}…`}
                      className="flex-1 resize-none rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-[16px] text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-accent-500 max-h-36" />
                    <button type="submit" disabled={!draft.trim() || sending} aria-label="Envoyer"
                      className="h-12 w-12 shrink-0 rounded-full bg-accent-600 hover:bg-accent-700 text-on-accent flex items-center justify-center disabled:opacity-40">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                    </button>
                  </div>
                  {sendError && <p role="alert" className="text-sm text-red-700 px-2">{sendError}</p>}
                  <p className="text-[11px] text-stone-500 px-2">Lien personnel : ne le partagez pas.</p>
                </form>
              ) : (
                <p className="bg-surface border-t border-stone-200 px-4 py-4 text-sm text-stone-500">Cette conversation est fermée.{presta?.phone ? ` Pour joindre ${prestaName} : ${presta.phone}.` : ""}</p>
              )}
            </section>
          )}

          {!chatOn && <p className="text-xs text-stone-500 text-center mt-4">Lien personnel : ne le partagez pas.</p>}
        </div>
      </main>
    </>
  );
}
