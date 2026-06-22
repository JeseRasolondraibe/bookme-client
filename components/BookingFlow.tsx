"use client";
import { useState } from "react";
import StepService from "./steps/StepService";
import StepSlot from "./steps/StepSlot";
import StepContact from "./steps/StepContact";
import StepConfirm from "./steps/StepConfirm";

export type Presta  = { id: string; slug: string; name: string; bio?: string; avatar_url?: string };
export type Service = { id: string; name: string; duration_min: number; price: number };
export type Booking = { service: Service; date: string; time: string; client_name: string; client_phone: string; client_email?: string };

export default function BookingFlow({ presta, services }: { presta: Presta; services: Service[] }) {
  const [step,    setStep]    = useState(1);
  const [booking, setBooking] = useState<Partial<Booking>>({});

  const patch = (data: Partial<Booking>) => setBooking(b => ({ ...b, ...data }));

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md">
        <header className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-lg flex-shrink-0 overflow-hidden">
            {presta.avatar_url
              ? <img src={presta.avatar_url} alt={presta.name} className="w-full h-full object-cover" />
              : presta.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-stone-900">{presta.name}</h1>
            {presta.bio && <p className="text-sm text-stone-500 mt-0.5">{presta.bio}</p>}
          </div>
        </header>
        <div className="flex gap-1.5 mb-8">
          {[1,2,3,4].map(n => (
            <div key={n} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${n <= step ? "bg-violet-500" : "bg-stone-200"}`} />
          ))}
        </div>
        {step === 1 && <StepService services={services} selected={booking.service} onSelect={s => { patch({ service: s }); setStep(2); }} />}
        {step === 2 && <StepSlot presta={presta} service={booking.service!} selected={{ date: booking.date, time: booking.time }} onSelect={(date, time) => { patch({ date, time }); setStep(3); }} onBack={() => setStep(1)} />}
        {step === 3 && <StepContact booking={booking as Booking} onSubmit={data => { patch(data); setStep(4); }} onBack={() => setStep(2)} />}
        {step === 4 && <StepConfirm booking={booking as Booking} presta={presta} onRestart={() => { setBooking({}); setStep(1); }} />}
      </div>
    </main>
  );
}
