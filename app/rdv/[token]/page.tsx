import type { Metadata } from "next";
import RdvPage from "@/components/RdvPage";

// Page personnelle d'un rendez-vous : récap + messagerie avec la presta.
// Le jeton du lien est la seule clé d'accès : jamais indexée, jamais mise
// en cache, et aucune donnée n'est lue ici côté serveur (tout passe par
// l'Edge Function `rdv`, depuis le navigateur).
export const metadata: Metadata = {
  title: "Mon rendez-vous – Book Me Again",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <RdvPage token={token} />;
}
