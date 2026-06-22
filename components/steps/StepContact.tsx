"use client";
import { useState } from "react";
import { Booking } from "../BookingFlow";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://flrtdhzcimbkbcgczmea.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default function StepContact({ booking, onSubmit, onBack }: {
  booking: Booking;
  onSubmit: (data: Pick<Booking, "client_name" | "client_phone" | "client_email">) => void;
  onBack: () => void;
}) {
  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const valid = name.trim().length > 1 && phone.trim().length >= 8;

  async function handleSubmit() {
    if (!valid) return;
    setLoading(true); setError("");
    try {
      const slug = window.location.pathname.split("/")[1];
      const res  = await fetch(`${SUPABASE_URL}/functions/v1/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          slug, service_id: booking.service.id, date: booking.date, time: booking.time,
          client_name: name.trim(), client_phone: phone.trim(), client_email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la réservation");
      onSubmit({ client_name: name, client_phone: phone, client_email: email || undefined });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <button onClick={onBack} className="text-stone-400 hover:text-stone-700 text-sm mb-4 block">← Retour</button>
      <div className="bg-white border border-stone-200 rounded-2xl p-4 mb-6">
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
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Prénom et nom</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Camille Laurent"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 bg-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Téléphone <span className="text-violet-500">*</span></label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="06 12 34 56 78"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 bg-white" />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Email <span className="text-stone-300">(optionnel)</span></label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="camille@mail.com"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200 bg-white" />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <button onClick={handleSubmit} disabled={!valid || loading}
        className="mt-6 w-full bg-violet-600 hover:bg-violet-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-medium py-3.5 rounded-xl transition-colors">
        {loading ? "Réservation en cours..." : "Réserver →"}
      </button>
      <p className="text-xs text-stone-400 text-center mt-3">Annulation gratuite jusqu'à 24h avant</p>
    </section>
  );
}
