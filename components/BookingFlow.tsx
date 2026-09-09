"use client";
import { useState } from "react";
import StepService from "./steps/StepService";
import StepSlot from "./steps/StepSlot";
import StepContact from "./steps/StepContact";
import StepConfirm from "./steps/StepConfirm";
import PrestaCard from "./PrestaCard";
import BookingSummary from "./BookingSummary";
import { PhoneIcon, CheckIcon } from "./icons";

export type Presta  = { id: string; slug: string; name: string; bio?: string; avatar_url?: string; phone?: string };
export type Service = { id: string; name: string; duration_min: number; price: number };
export type Booking = { service: Service; date: string; time: string; client_name: string; client_phone: string; client_email?: string };

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
  const [booking, setBooking] = useState<Partial<Booking>>({});

  const patch = (data: Partial<Booking>) => setBooking(b => ({ ...b, ...data }));

  return (
    <main className="min-h-screen bg-stone-50 py-6 px-4 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <header className="flex flex-wrap items-center gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-stone-900 truncate">{presta.name}</h1>
            <p className="text-sm text-stone-500 mt-0.5">Réservation en ligne</p>
          </div>
          {presta.phone && (
            <div className="ml-auto flex items-center gap-2 text-sm">
              <span className="hidden sm:inline text-stone-500">Une question ?</span>
              <a href={`tel:${presta.phone}`}
                className="flex items-center gap-2 font-medium text-stone-900 hover:text-accent-600 transition-colors">
                <PhoneIcon className="text-accent-600" />
                {presta.phone}
              </a>
            </div>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_300px] items-start">
          <PrestaCard presta={presta} />

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
            {step === 2 && <StepSlot presta={presta} service={booking.service!} selected={{ date: booking.date, time: booking.time }} onSelect={(date, time) => { patch({ date, time }); setStep(3); }} onBack={() => setStep(1)} />}
            {step === 3 && <StepContact booking={booking as Booking} onSubmit={data => { patch(data); setStep(4); }} onBack={() => setStep(2)} />}
            {step === 4 && <StepConfirm booking={booking as Booking} presta={presta} onRestart={() => { setBooking({}); setStep(1); }} />}
          </div>

          {/* L'écran de confirmation se suffit à lui-même : le récap latéral ferait doublon. */}
          {step < 4 && (
            <div className="xl:col-start-3">
              <BookingSummary booking={booking} step={step} onContinue={() => setStep(2)} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
