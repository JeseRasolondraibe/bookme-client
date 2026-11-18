"use client";
import { useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://flrtdhzcimbkbcgczmea.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export default function Unsubscribe({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [presta, setPresta] = useState<string | null>(null);

  async function confirm() {
    setState("loading");
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ token }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error();
      setPresta(d.presta ?? null); setState("done");
    } catch { setState("error"); }
  }

  if (state === "done") return (
    <>
      <h1 className="text-xl font-semibold text-stone-900">C&apos;est fait</h1>
      <p className="text-sm text-stone-600 mt-3">Vous ne recevrez plus d&apos;offres{presta ? ` de ${presta}` : ""}. Les emails liés à vos rendez-vous (confirmation, rappel) continuent d&apos;arriver normalement.</p>
    </>
  );
  return (
    <>
      <h1 className="text-xl font-semibold text-stone-900">Ne plus recevoir d&apos;offres ?</h1>
      <p className="text-sm text-stone-600 mt-3">Vous ne recevrez plus les offres et rappels promotionnels de ce prestataire. Les emails de vos rendez-vous ne sont pas concernés.</p>
      {state === "error" && <p className="text-sm text-red-500 mt-3">Ce lien n&apos;est pas valable. Réessayez depuis le dernier email reçu.</p>}
      <button onClick={confirm} disabled={state === "loading"}
        className="mt-6 w-full bg-stone-900 text-white font-medium py-3.5 rounded-xl disabled:opacity-60">
        {state === "loading" ? "…" : "Me désinscrire"}
      </button>
    </>
  );
}
