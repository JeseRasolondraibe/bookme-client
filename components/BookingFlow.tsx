"use client";
import { useEffect, useState } from "react";
import StepService from "./steps/StepService";
import StepSlot from "./steps/StepSlot";
import StepContact from "./steps/StepContact";
import StepConfirm from "./steps/StepConfirm";
import PrestaCard from "./PrestaCard";
import BookingSummary from "./BookingSummary";
import PortfolioGallery from "./PortfolioGallery";
import { CheckIcon } from "./icons";

export type Presta  = {
  id: string; slug: string; name: string; bio?: string; avatar_url?: string; phone?: string;
  // Pas d'adresse exacte côté public : seulement la ville ou le quartier choisi par la presta.
  city?: string | null; instagram?: string; tiktok?: string; website?: string; other_link?: string;
  // Horizon de réservation, cf. lib/horizon.ts
  booking_horizon_months?: number | null; booking_horizon_date?: string | null;
};
export type ServiceVideo = { id: string; platform: "tiktok" | "instagram" | "youtube"; video_id: string; position: number };
export type Service = { id: string; name: string; duration_min: number; price: number; photo_url?: string; description?: string; videos?: ServiceVideo[] };
/**
 * Lieu du rdv, résolu côté serveur pour la date choisie (exception du jour →
 * planning récurrent → adresse du profil). `id` NULL = presta mono-adresse.
 */
// Pas d'adresse côté page publique : elle n'est envoyée que dans l'email de
// confirmation. Seuls le libellé du lieu et la ville publique sont connus ici.
export type BookingLocation = { id: string | null; label: string | null; city?: string | null };
export type Booking = { service: Service; date: string; time: string; client_name: string; client_phone: string; client_email?: string; location?: BookingLocation | null };

const STEPS = ["Prestation", "Créneau", "Vos coordonnées", "Confirmation"];

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-start">
      {STEPS.map((label, i) => {
        const n    = i + 1;
        const done = n < step;
        const here = n === step;
        return (
          <li key={label} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <span aria-hidden="true"
                className={`absolute top-4 right-1/2 w-full h-px ${done || here ? "bg-accent-400" : "bg-stone-200"}`} />
            )}
            <span className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
              ${done  ? "bg-accent-600 text-white"
              : here  ? "bg-accent-600 text-white ring-4 ring-accent-50"
                      : "bg-stone-100 text-stone-400"}`}>
              {done ? <CheckIcon className="w-3.5 h-3.5" /> : n}
            </span>
            <span className={`mt-2 text-xs text-center px-1 hidden sm:block ${here ? "text-accent-600 font-semibold" : "text-stone-400"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function BookingFlow({ presta, services }: { presta: Presta; services: Service[] }) {
  const [step,    setStep]    = useState(1);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);
  const [booking, setBooking] = useState<Partial<Booking>>({});

  const patch = (data: Partial<Booking>) => setBooking(b => ({ ...b, ...data }));

  // WEB-15 : chaque étape est une entrée d'historique, pour que le bouton
  // retour du navigateur (et le geste retour sur iPhone) revienne à l'étape
  // précédente au lieu de quitter la page en perdant la saisie. L'URL ne
  // change pas : seul history.state porte l'étape.
  useEffect(() => {
    window.history.replaceState({ ...(window.history.state ?? {}), bookingStep: 1 }, "");
    const onPop = (e: PopStateEvent) => {
      const target = Number(e.state?.bookingStep ?? 1);
      setStep(current => {
        // Après confirmation, revenir en arrière ne doit pas rouvrir le
        // formulaire d'un rdv déjà pris : on repart d'une réservation vierge.
        if (current === 4) { setBooking({}); return 1; }
        return target >= 1 && target <= 3 ? target : 1;
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goTo = (n: number) => {
    setStep(n);
    window.history.pushState({ ...(window.history.state ?? {}), bookingStep: n }, "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  // Les boutons « Retour » internes passent par l'historique, pour rester
  // cohérents avec le bouton du navigateur.
  const goBack = () => window.history.back();

  return (
    <main className="min-h-screen bg-stone-50 py-6 px-3 sm:px-4 lg:px-6">
      <div className="w-full max-w-[1600px] mx-auto">
        {/*
          4 items à plat dans la grille (pas de wrapper imbriqué) pour pouvoir
          contrôler l'ordre par breakpoint :
            - mobile (colonne unique) : suit l'ordre du DOM, donc Prestation ->
              Réservation (bouton Continuer) -> Réalisations. Le process de
              réservation ne se retrouve jamais coincé sous la galerie vidéo.
            - lg/xl : PrestaCard span 3 lignes "réserve" la colonne 1, ce qui
              pousse Réalisations (4e item auto-placé) sous la carte de
              prestation dans la colonne 2, pendant que Réservation reste en
              haut (colonne 3 à partir de xl).
        */}
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_300px] items-start">
          <div className="lg:row-span-3">
            <PrestaCard presta={presta} />
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
            {step < 4 && (
              <nav aria-label="Étapes" className="mb-8 pb-7 border-b border-stone-100">
                <Stepper step={step} />
                <p className="sm:hidden text-center text-xs text-stone-400 mt-3">
                  Étape {step} sur {STEPS.length} · <span className="text-accent-600 font-semibold">{STEPS[step - 1]}</span>
                </p>
              </nav>
            )}

            {step === 1 && <StepService services={services} selected={booking.service} onSelect={s => patch({ service: s })} />}
            {step === 2 && <StepSlot presta={presta} service={booking.service!} selected={{ date: booking.date, time: booking.time }} onSelect={(date, time, location) => { setSlotNotice(null); patch({ date, time, location }); goTo(3); }} onBack={goBack} notice={slotNotice} />}
            {step === 3 && <StepContact booking={booking as Booking} onSubmit={data => { patch(data); goTo(4); }} onBack={goBack}
              onSlotTaken={(msg, typed) => { setSlotNotice(msg); patch({ ...typed, time: undefined }); goBack(); }} />}
            {step === 4 && <StepConfirm booking={booking as Booking} presta={presta} onRestart={() => { setBooking({}); goTo(1); }} />}
          </div>

          {/* L'écran de confirmation se suffit à lui-même : le récap latéral ferait doublon. */}
          {step < 4 && (
            <div className="xl:col-start-3">
              <BookingSummary booking={booking} step={step} onContinue={() => goTo(2)} />
            </div>
          )}

          {/* Toujours visible : dès qu'un service a des vidéos, elles apparaissent ici. */}
          <PortfolioGallery services={services} />
        </div>
      </div>
    </main>
  );
}
