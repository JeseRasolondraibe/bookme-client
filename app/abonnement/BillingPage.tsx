"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";

// Page d'abonnement des prestas : connexion par code email, puis paiement
// Stripe. C'est le SEUL endroit où l'on parle de prix : l'app iOS est une app
// compagnon gratuite et ne doit contenir aucun lien ni incitation à payer
// (règle App Store 3.1.3(f)).

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://flrtdhzcimbkbcgczmea.supabase.co";
const PRICE_LABEL  = "13,99 € / mois";

type PrestaInfo = { name: string | null; slug: string; is_active: boolean; trial_ends_at: string | null };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
}

const input = "w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-400 bg-white";
const primary = "w-full bg-accent-600 hover:bg-accent-700 disabled:bg-stone-200 disabled:text-stone-400 text-white font-medium py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98]";
const link = "text-sm text-accent-600 hover:text-accent-700 disabled:opacity-50";

export default function BillingPage() {
  const supabase = useMemo(() => createClient(), []);
  const params = useSearchParams();
  const justPaid = params.get("statut") === "merci";

  const [session, setSession] = useState<Session | null>(null);
  const [ready,   setReady]   = useState(false);
  const [presta,  setPresta]  = useState<PrestaInfo | null>(null);

  const [email,   setEmail]   = useState("");
  const [code,    setCode]    = useState("");
  const [step,    setStep]    = useState<"email" | "code">("email");
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) { setPresta(null); return; }
    supabase.from("prestas").select("name, slug, is_active, trial_ends_at").eq("id", session.user.id).maybeSingle()
      .then(({ data }) => setPresta(data as PrestaInfo | null));
  }, [session, supabase, justPaid]);

  async function sendCode() {
    setBusy(true); setError("");
    // shouldCreateUser: false → on ne crée pas de compte ici, l'inscription se fait dans l'app.
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: false } });
    setBusy(false);
    if (err && !/signups not allowed|user not found/i.test(err.message)) { setError(err.message); return; }
    // Même écran que le compte existe ou non (on ne révèle pas qui est inscrit).
    setStep("code");
  }

  async function verifyCode() {
    setBusy(true); setError("");
    const { error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: "email" });
    setBusy(false);
    if (err) setError("Code incorrect ou expiré. Vérifie le dernier email reçu.");
  }

  async function callBilling(fn: "billing-checkout" | "billing-portal") {
    if (!session) return;
    setBusy(true); setError("");
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erreur inattendue");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
      setBusy(false);
    }
  }

  const now = Date.now();
  const trialEnd = presta?.trial_ends_at ? new Date(presta.trial_ends_at).getTime() : 0;
  const inTrial  = !!presta && !presta.is_active && trialEnd > now;
  const expired  = !!presta && !presta.is_active && trialEnd <= now;

  return (
    <main className="flex-1 bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <p className="text-2xl font-bold text-accent-600 text-center">Book Me Again</p>
        <h1 className="text-lg font-semibold text-stone-900 text-center mt-1 mb-6">Mon abonnement</h1>

        {!ready ? (
          <p className="text-sm text-stone-400 text-center">Chargement…</p>
        ) : !session ? (
          step === "email" ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-stone-600 text-center">Connecte-toi avec l&apos;email de ton compte Book Me Again : on t&apos;envoie un code.</p>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" className={input} autoFocus />
              <button onClick={sendCode} disabled={busy || !email.includes("@")} className={primary}>
                {busy ? "Envoi…" : "Recevoir un code"}
              </button>
              <p className="text-xs text-stone-400 text-center">Tu n&apos;as pas encore de compte ? Crée-le depuis l&apos;app Book Me Again.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-stone-600 text-center">Si un compte existe pour <strong>{email.trim()}</strong>, tu vas recevoir un code par email.</p>
              <input inputMode="numeric" autoComplete="one-time-code" value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Code" className={`${input} text-center text-2xl font-bold tracking-[0.4em]`} autoFocus />
              <button onClick={verifyCode} disabled={busy || code.length < 6} className={primary}>
                {busy ? "Vérification…" : "Valider"}
              </button>
              <button onClick={() => { setStep("email"); setCode(""); }} className={link}>Changer d&apos;email</button>
            </div>
          )
        ) : !presta ? (
          <p className="text-sm text-stone-500 text-center">Aucun profil Book Me Again n&apos;est associé à ce compte. Termine ton inscription dans l&apos;app.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {justPaid && (
              <p className="text-sm text-green-700 bg-green-50 rounded-xl p-3 text-center">
                Merci ! Ton paiement est enregistré. L&apos;activation peut prendre quelques secondes.
              </p>
            )}

            <div className="bg-stone-50 rounded-xl p-4 text-sm">
              <p className="text-stone-500">Compte</p>
              <p className="font-medium text-stone-900">{presta.name || session.user.email}</p>
              <p className="text-stone-500 mt-3">Statut</p>
              <p className="font-medium text-stone-900">
                {presta.is_active ? "Abonnement actif ✓"
                  : inTrial ? `Période gratuite jusqu'au ${formatDate(presta.trial_ends_at!)}`
                  : "Accès suspendu : ta page de réservation est désactivée"}
              </p>
            </div>

            {presta.is_active ? (
              <button onClick={() => callBilling("billing-portal")} disabled={busy} className={primary}>
                {busy ? "Ouverture…" : "Gérer mon abonnement"}
              </button>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-3xl font-bold text-stone-900">{PRICE_LABEL}</p>
                  <p className="text-xs text-stone-500 mt-1">Sans engagement, résiliable à tout moment.</p>
                  {inTrial && (
                    <p className="text-xs text-stone-500 mt-1">
                      Premier prélèvement à la fin de ta période gratuite, le {formatDate(presta.trial_ends_at!)}.
                    </p>
                  )}
                </div>
                <button onClick={() => callBilling("billing-checkout")} disabled={busy} className={primary}>
                  {busy ? "Ouverture du paiement…" : expired ? "Réactiver mon compte" : "M'abonner"}
                </button>
              </>
            )}

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button onClick={() => supabase.auth.signOut()} className={link}>Se déconnecter</button>
          </div>
        )}
        {!session && error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
      </div>
    </main>
  );
}
