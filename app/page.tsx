import type { Metadata } from "next";

// Page d'accueil de bookmeagain.com (remplace la page de démarrage Next.js).
// Cible : une presta qui arrive depuis le lien « Créez votre page » en bas
// d'une page de réservation. Sobre, en ambiance Épuré (globals.css).

export const metadata: Metadata = {
  title: "Book Me Again – Votre page de réservation en ligne",
  description: "La page de réservation des prestataires indépendant(e)s : vos client(e)s réservent en ligne, vous gérez tout depuis l'app. 13,99 € par mois, 14 jours d'essai.",
};

const POINTS = [
  { title: "Votre lien de réservation", text: "Une page à votre image, à partager sur Instagram, TikTok ou WhatsApp. Vos client(e)s réservent sans créer de compte." },
  { title: "Votre planning, vos règles", text: "Horaires, pauses, congés, plusieurs lieux, séances : les créneaux proposés suivent votre organisation." },
  { title: "Moins d'oublis", text: "Confirmation immédiate et rappel la veille par email. Votre adresse exacte n'est communiquée qu'aux client(e)s qui réservent." },
];

export default function Home() {
  return (
    <main className="flex-1 bg-stone-50 px-5 py-14 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-accent-600">Book Me Again</p>
        <h1 className="font-head mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
          Vos client(e)s réservent en ligne.<br />Vous gardez la main.
        </h1>
        <p className="mt-5 text-lg text-stone-600 max-w-2xl">
          L&apos;app des prestataires indépendant(e)s (ongles, coiffure, soins, massage) pour recevoir
          des réservations 24h/24 sans gérer les messages un par un.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {POINTS.map(p => (
            <section key={p.title} className="bg-surface border border-stone-200 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-stone-900">{p.title}</h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">{p.text}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 bg-surface border border-stone-200 rounded-2xl p-6 sm:flex sm:items-center sm:justify-between gap-6">
          <div>
            <p className="font-head text-2xl font-bold text-stone-900">13,99 € <span className="text-base font-medium text-stone-500">par mois</span></p>
            <p className="mt-1 text-sm text-stone-600">14 jours d&apos;essai gratuit, sans engagement.</p>
          </div>
          <p className="mt-4 sm:mt-0 text-sm font-semibold text-stone-700">Bientôt disponible sur l&apos;App Store</p>
        </section>

        <footer className="mt-12 text-xs text-stone-500 flex gap-4">
          <a href="/privacy" className="hover:text-stone-700">Confidentialité</a>
          <a href="/abonnement" className="hover:text-stone-700">Mon abonnement</a>
        </footer>
      </div>
    </main>
  );
}
