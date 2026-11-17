"use client";
import { Booking } from "./BookingFlow";
import { ClockIcon, TagIcon, CalendarIcon } from "./icons";
import { formatDuration } from "@/lib/duration";
import { formatPrice } from "@/lib/price";

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
  const { service, date, time, location } = booking;
  if (!service) return null;

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-6">
      <div className="bg-surface rounded-2xl border border-stone-200 p-5">
        <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Votre réservation</p>
        <p className="text-sm font-semibold text-stone-900">{service.name}</p>

        <div className="flex flex-col gap-2 mt-3">
          <p className="flex items-center gap-2 text-sm text-stone-500">
            <ClockIcon className="w-3.5 h-3.5 text-stone-400" />
            {formatDuration(service.duration_min)}
          </p>
          <p className="flex items-center gap-2 text-sm text-stone-500">
            <TagIcon className="w-3.5 h-3.5 text-stone-400" />
            {formatPrice(service.price)}
          </p>
          {date && time && (
            <p className="flex items-center gap-2 text-sm text-stone-500 first-letter:uppercase">
              <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
              {formatDate(date)} à {time}
            </p>
          )}
          {(location?.label || location?.city) && (
            <p className="flex items-start gap-2 text-sm text-stone-500">
              <svg aria-hidden="true" className="mt-0.5 w-3.5 h-3.5 shrink-0 text-stone-400" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="leading-snug">
                <span className="block font-medium text-stone-700">{[location.label, location.city].filter(Boolean).join(" · ")}</span>
              </span>
            </p>
          )}
        </div>

        {step === 1 && (
          <button onClick={onContinue}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-on-accent font-medium py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98]">
            Choisir un créneau
            <span aria-hidden="true">›</span>
          </button>
        )}
        {/* Réassurance au plus près du bouton, là où la cliente hésite. */}
        <ul className="mt-4 pt-4 border-t border-stone-100 flex flex-col gap-2">
          {["Confirmation immédiate par email", "Sans création de compte", "Rappel la veille du rendez-vous"].map(t => (
            <li key={t} className="flex items-center gap-2 text-xs text-stone-500">
              <span aria-hidden="true" className="text-accent-600">✓</span>{t}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
