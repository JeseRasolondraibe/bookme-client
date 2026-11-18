"use client";
import { useState } from "react";
import { Booking, Presta, bookingPrice } from "../BookingFlow";
import { depositAmount, refundDelayLabel } from "@/lib/deposit";
import Turnstile, { TURNSTILE_SITE_KEY } from "../Turnstile";
import { formatPrice } from "@/lib/price";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://flrtdhzcimbkbcgczmea.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

export default function StepContact({ booking, presta, onSubmit, onBack, onSlotTaken }: {
  booking: Booking;
  presta?: Presta;
  onSubmit: (data: Pick<Booking, "client_name" | "client_phone" | "client_email">) => void;
  onBack: () => void;
  /** WEB-16 : le créneau a été pris entre-temps (409) : retour au choix du créneau. */
  onSlotTaken?: (message: string, typed: Pick<Booking, "client_name" | "client_phone" | "client_email">) => void;
}) {
  // Pré-remplis si la cliente revient ici après un créneau pris entre-temps.
  const [name,    setName]    = useState(booking.client_name ?? "");
  const [phone,   setPhone]   = useState(booking.client_phone ?? "");
  const [email,   setEmail]   = useState(booking.client_email ?? "");
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  // Format volontairement permissif (pas de RFC 5322 complet) : on veut juste
  // écarter les fautes de frappe grossières, pas rejeter des adresses
  // valides mais inhabituelles. L'email est obligatoire depuis que c'est le
  // seul canal de confirmation/rappel (le SMS a été retiré).
  const total = bookingPrice(booking);
  const deposit = presta?.deposits_enabled && presta?.stripe_charges_enabled ? depositAmount(booking.service, total) : 0;
  const refundHours = presta?.cancel_refund_hours ?? 48;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const valid = name.trim().length > 1 && phone.trim().length >= 8 && emailValid
    && (!TURNSTILE_SITE_KEY || !!captcha);

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
          slug, service_id: booking.service.id, option_ids: (booking.options ?? []).map(o => o.id), date: booking.date, time: booking.time,
          client_name: name.trim(), client_phone: phone.trim(), client_email: email.trim(),
          turnstile_token: captcha || undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 409 && onSlotTaken) {
        onSlotTaken(data.error ?? "Ce créneau n'est plus disponible.", { client_name: name, client_phone: phone, client_email: email });
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la réservation");
      // Acompte : le créneau est bloqué 15 min, la cliente paie chez Stripe
      // puis revient sur /<slug>/confirmation.
      if (data.checkout_url) { window.location.href = data.checkout_url; return; }
      onSubmit({ client_name: name, client_phone: phone, client_email: email });
    } catch (e: any) {
      setError(e.message);
      setCaptchaReset(n => n + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <button onClick={onBack} className="text-stone-400 hover:text-stone-700 text-sm mb-4 block">← Retour</button>
      <div className="bg-surface border border-stone-200 rounded-xl p-4 mb-6">
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
        {(booking.slotPrice?.adjustments ?? []).map(a => (
          <div key={a.name} className="flex justify-between gap-4 text-sm py-1.5 border-b border-stone-100">
            <span className="text-stone-500">{a.name}</span>
            <span className="font-medium text-stone-900">{a.amount > 0 ? "+" : "−"}{formatPrice(Math.abs(a.amount))}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-stone-500">{(booking.options ?? []).length > 0 || booking.slotPrice ? "Total" : "Prix"}</span><span className="font-semibold text-stone-900">{formatPrice(total)}</span>
        </div>
        {deposit > 0 && (
          <>
            <div className="flex justify-between text-sm py-1.5 border-t border-stone-100">
              <span className="text-stone-500">Acompte à régler maintenant</span><span className="font-semibold text-stone-900">{formatPrice(deposit)}</span>
            </div>
            {total > deposit && (
              <div className="flex justify-between text-sm py-1.5">
                <span className="text-stone-500">Reste à régler sur place</span><span className="font-medium text-stone-900">{formatPrice(Math.round((total - deposit) * 100) / 100)}</span>
              </div>
            )}
          </>
        )}
      </div>
      {deposit > 0 && (
        <p className="text-xs text-stone-600 bg-stone-100 rounded-xl px-4 py-3 mb-6">
          L&apos;acompte est versé directement à {presta?.name}. En cas d&apos;annulation {refundDelayLabel(refundHours)}, il vous est remboursé ; au-delà, il est conservé.
          Vous disposez de 15 minutes pour payer, sinon le créneau est libéré.
        </p>
      )}
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Prénom et nom</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Camille Laurent"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-400 bg-surface" />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Téléphone <span className="text-accent-600">*</span></label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="06 12 34 56 78"
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-400 bg-surface" />
        </div>
        <div>
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Email <span className="text-accent-600">*</span></label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => setEmailTouched(true)} placeholder="camille@mail.com"
            aria-invalid={emailTouched && !!email.trim() && !emailValid}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-400 bg-surface" />
          {/* WEB-09 : le bouton restait grisé sans explication. */}
          {emailTouched && !!email.trim() && !emailValid
            ? <p className="text-xs text-red-500 mt-1.5">Adresse email invalide (exemple : camille@mail.com).</p>
            : <p className="text-xs text-stone-400 mt-1.5">Pour la confirmation et le rappel de votre rendez-vous.</p>}
        </div>
      </div>
      <Turnstile onToken={setCaptcha} resetKey={captchaReset} />
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <button onClick={handleSubmit} disabled={!valid || loading}
        className="mt-6 w-full bg-accent-600 hover:bg-accent-700 disabled:bg-stone-200 disabled:text-stone-400 text-on-accent font-medium py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98]">
        {loading ? (deposit > 0 ? "Redirection vers le paiement..." : "Réservation en cours...") : deposit > 0 ? `Payer l'acompte de ${formatPrice(deposit)} →` : "Réserver →"}
      </button>
      <p className="text-xs text-stone-500 text-center mt-3">
        {deposit > 0 ? "Paiement sécurisé par Stripe · Confirmation par email après paiement" : "Confirmation immédiate par email · Sans création de compte"}
        <br />Pour annuler, contactez votre prestataire</p>
    </section>
  );
}
