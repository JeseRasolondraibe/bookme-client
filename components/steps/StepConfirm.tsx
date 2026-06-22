"use client";
import { Booking, Presta } from "../BookingFlow";

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
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(booking.service.name + " chez " + presta.name)}&dates=${fmt(start)}/${fmt(end)}`, "_blank");
  }

  return (
    <section className="text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-stone-900 mb-1">RDV confirmé !</h2>
      <p className="text-sm text-stone-400 mb-8">Un SMS de confirmation vous a été envoyé au {booking.client_phone}</p>
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6 text-left">
        <p className="text-sm font-semibold text-stone-900 mb-3">{presta.name}</p>
        <div className="flex justify-between text-sm py-1.5 border-b border-stone-100">
          <span className="text-stone-500">Prestation</span><span className="font-medium text-stone-900">{booking.service.name}</span>
        </div>
        <div className="flex justify-between text-sm py-1.5 border-b border-stone-100">
          <span className="text-stone-500">Date</span><span className="font-medium text-stone-900">{formatDate(booking.date)}</span>
        </div>
        <div className="flex justify-between text-sm py-1.5 border-b border-stone-100">
          <span className="text-stone-500">Heure</span><span className="font-medium text-stone-900">{booking.time}</span>
        </div>
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-stone-500">Prix</span><span className="font-semibold text-stone-900">{booking.service.price} €</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={addToCalendar}
          className="w-full border border-stone-200 bg-white hover:border-violet-300 text-stone-700 font-medium py-3 rounded-xl text-sm transition-colors">
          Ajouter à mon calendrier
        </button>
        <button onClick={onRestart} className="w-full text-stone-400 hover:text-stone-600 text-sm py-2 transition-colors">
          ← Retour au profil
        </button>
      </div>
    </section>
  );
}
