"use client";
import { Booking } from "./BookingFlow";
import { ClockIcon, TagIcon, CalendarIcon, LockIcon } from "./icons";
import { formatDuration } from "@/lib/duration";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long",
  });
}

// Colonne de droite : récapitulatif vivant de la réservation en cours.
// Le CTA n'est porté ici qu'à l'étape 1 — les étapes suivantes ont le leur,
// au plus près du champ que le client vient de remplir.
export default function BookingSummary({ booking, step, onContinue }: {
  booking: Partial<Booking>;
  step: number;
  onContinue: () => void;
}) {
  const { service, date, time } = booking;
  if (!service) return null;

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Votre réservation</p>
        <p className="text-sm font-semibold text-stone-900">{service.name}</p>

        <div className="flex flex-col gap-2 mt-3">
          <p className="flex items-center gap-2 text-sm text-stone-500">
            <ClockIcon className="w-3.5 h-3.5 text-stone-400" />
            {formatDuration(service.duration_min)}
          </p>
          <p className="flex items-center gap-2 text-sm text-stone-500">
            <TagIcon className="w-3.5 h-3.5 text-stone-400" />
            {service.price} €
          </p>
          {date && time && (
            <p className="flex items-center gap-2 text-sm text-stone-500 first-letter:uppercase">
              <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
              {formatDate(date)} à {time}
            </p>
          )}
        </div>

        {step === 1 && (
          <button onClick={onContinue}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-medium py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98]">
            Continuer
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-3">
        {[
          { icon: <CalendarIcon className="w-4 h-4 text-stone-400" />, text: "Réservation en ligne 24h/24 et 7j/7" },
          { icon: <ClockIcon className="w-4 h-4 text-stone-400" />,    text: "Vous recevez une confirmation par email" },
          { icon: <LockIcon className="w-4 h-4 text-stone-400" />,     text: "Vos données sont sécurisées" },
        ].map(({ icon, text }) => (
          <p key={text} className="flex items-start gap-3 text-sm text-stone-600 leading-snug">
            <span className="mt-0.5">{icon}</span>
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
