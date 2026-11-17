import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase-public";
import { themeOf, themeStyle } from "@/lib/themes";

// Retour depuis Stripe après paiement de l'acompte. Stripe n'y renvoie qu'en
// cas de succès ; la confirmation définitive (email) part du webhook.
export const metadata = { robots: { index: false } };

export default async function ConfirmationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: presta } = await createPublicClient()
    .from("prestas").select("name, theme, phone").eq("slug", slug).single();
  if (!presta) notFound();

  return (
    <main style={themeStyle(themeOf(presta.theme))} className="flex-1 min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
        <p className="text-3xl" aria-hidden="true">✓</p>
        <h1 className="font-head text-xl font-semibold text-stone-900 mt-2">Acompte reçu, merci !</h1>
        <p className="text-sm text-stone-600 mt-3">
          Votre rendez-vous avec {presta.name} est confirmé. Vous allez recevoir un email récapitulatif dans quelques instants.
        </p>
        <p className="text-xs text-stone-500 mt-4">Pas d&apos;email d&apos;ici quelques minutes ? Pensez à vérifier vos spams.</p>
        <a href={`/${slug}`} className="mt-6 inline-block text-sm text-accent-700 underline">Retour à la page de {presta.name}</a>
      </div>
    </main>
  );
}
