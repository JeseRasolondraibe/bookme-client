"use client";
import { Booking, Presta, bookingPrice, bookingPricing } from "../BookingFlow";
import { formatPrice } from "@/lib/price";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default function StepConfirm({ booking, presta, onRestart }: {
  booking: Booking; presta: Presta; onRestart: () => void;
}) {
  function addToCalendar() {
    const start = new Date(`${booking.date}T${booking.time}:00`);
    const end   = new Date(start.getTime() + booking.service.duration_min * 60000);
    const fmt   = (d: Date) => d.toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";
    // L'adresse n'est pas connue de la page publique (confidentialité) : la
    // cliente la retrouve dans son email de confirmation.
    const locationParam = "";
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.service.name + " chez " + presta.name)}&dates=${fmt(start)}/${fmt(end)}${locationParam}`, "_blank");
  }

  return (
    <section className="text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 className="font-head text-2xl font-semibold text-stone-900 mb-1">C&apos;est réservé !</h2>
      <p className="text-sm text-stone-400 mb-8">Un email de confirmation, avec l&apos;adresse du rendez-vous, vous a été envoyé{booking.client_email ? ` à ${booking.client_email}` : ""}.</p>
      <div className="bg-surface border border-stone-200 rounded-xl p-4 mb-6 text-left">
        <p className="text-sm font-semibold text-stone-900 mb-3">{presta.name}</p>
        <div className="flex justify-between text-sm py-1.5 border-b border-stone-100">
          <span className="text-stone-500">Prestation</span><span className="font-medium text-stone-900">{booking.service.name}</span>
        </div>
        {(booking.options ?? []).length > 0 && (
          <div className="flex justify-between gap-4 text-sm py-1.5 border-b border-stone-100">
            <span className="text-stone-500">Options</span>
            <span className="font-medium text-stone-900 text-right">{(booking.options ?? []).map(o => o.name).join(", ")}</span>
          </div>
        )}
        <div className="flex justify-between text-sm py-1.5 border-b border-stone-100">
          <span className="text-stone-500">Date</span><span className="font-medium text-stone-900">{formatDate(booking.date)}</span>
        </div>
        <div className="flex justify-between text-sm py-1.5 border-b border-stone-100">
          <span className="text-stone-500">Heure</span><span className="font-medium text-stone-900">{booking.time}</span>
        </div>
        <div className="flex justify-between gap-4 text-sm py-1.5 border-b border-stone-100">
          <span className="text-stone-500 shrink-0">Adresse</span>
          <span className="font-medium text-stone-900 text-right">
            {(booking.location?.label || booking.location?.city || presta.city) && (
              <span className="block">{[booking.location?.label, booking.location?.city ?? presta.city].filter(Boolean).join(" · ")}</span>
            )}
            <span className="font-normal text-stone-500">Envoyée par email</span>
          </span>
        </div>
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-stone-500">{(booking.options ?? []).length > 0 || bookingPricing(booking).adjustments.length > 0 ? "Total" : "Prix"}</span><span className="font-semibold text-stone-900">{formatPrice(bookingPrice(booking))}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={addToCalendar}
          className="w-full border border-stone-200 bg-surface hover:border-accent-400 text-stone-700 font-medium py-3 rounded-xl text-sm transition-all active:scale-[0.98]">
          Ajouter à mon calendrier
        </button>
        <button onClick={onRestart} className="w-full text-stone-400 hover:text-stone-600 text-sm py-2 transition-colors">
          ← Retour au profil
        </button>
      </div>
    </section>
  );
}
