// Retour de la presta après l'inscription Stripe (lien ouvert depuis l'app).
export const metadata = { title: "Stripe · Book Me Again", robots: { index: false } };

export default async function StripeRetour({ searchParams }: { searchParams: Promise<{ etat?: string }> }) {
  const { etat } = await searchParams;
  const done = etat === "termine";
  return (
    <main className="flex-1 min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">{done ? "C'est noté !" : "Lien expiré"}</h1>
        <p className="text-sm text-stone-600 mt-3">
          {done
            ? "Revenez dans l'app Book Me Again : l'état de votre compte Stripe s'y met à jour. Stripe peut demander quelques minutes pour vérifier vos informations."
            : "Le lien d'inscription Stripe a expiré. Revenez dans l'app Book Me Again et appuyez à nouveau sur « Connecter Stripe »."}
        </p>
        <a href="bookmeios://deposits" className="mt-6 inline-block w-full bg-stone-900 text-white font-medium py-3.5 rounded-xl">Ouvrir l&apos;app</a>
      </div>
    </main>
  );
}
