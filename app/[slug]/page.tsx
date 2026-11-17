import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase-public";
import BookingFlow from "@/components/BookingFlow";
import type { Metadata } from "next";
import { themeOf, themeStyle } from "@/lib/themes";

// PRO-07 : titre d'onglet et aperçu riche (WhatsApp, iMessage, Instagram)
// quand la presta partage son lien.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data: presta } = await supabase
    .from("prestas")
    .select("name, bio, avatar_url")
    .eq("slug", slug)
    .single();
  if (!presta) return { title: "Book Me Again" };

  const title = `${presta.name} – Réservation en ligne`;
  const bio = (presta.bio ?? "").replace(/\s+/g, " ").trim();
  const description = bio ? (bio.length > 155 ? `${bio.slice(0, 152)}…` : bio) : `Réservez votre rendez-vous chez ${presta.name} en quelques clics.`;
  const images = presta.avatar_url ? [{ url: presta.avatar_url }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: { title, description, url: `/${slug}`, siteName: "Book Me Again", type: "website", locale: "fr_FR", images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images: images?.map(i => i.url) },
  };
}

export default async function PrestaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: presta } = await supabase
    .from("prestas")
    .select("id, slug, name, bio, avatar_url, phone, city, instagram, tiktok, website, other_link, is_active, trial_ends_at, booking_horizon_months, booking_horizon_date, theme")
    .eq("slug", slug)
    .single();

  const inTrial = presta?.trial_ends_at
    ? new Date(presta.trial_ends_at) > new Date()
    : false;

  if (!presta) notFound();

  // Abonnement non réglé : plutôt qu'une 404 (la cliente croirait que la
  // presta a disparu), on explique que la réservation en ligne est suspendue
  // et on donne le moyen de la joindre directement.
  if (!presta.is_active && !inTrial) {
    return (
      <main style={themeStyle(themeOf(presta.theme))} className="flex-1 bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-surface border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <h1 className="font-head text-xl font-semibold text-stone-900">{presta.name}</h1>
          <p className="text-sm text-stone-600 mt-3">
            La réservation en ligne est momentanément indisponible.
          </p>
          {presta.phone ? (
            <a href={`tel:${presta.phone}`}
              className="mt-6 inline-block w-full bg-accent-600 hover:bg-accent-700 text-on-accent font-medium py-3.5 rounded-xl">
              Appeler {presta.phone}
            </a>
          ) : (
            <p className="text-sm text-stone-500 mt-4">Contacte directement ta prestataire pour prendre rendez-vous.</p>
          )}
        </div>
      </main>
    );
  }

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_min, price, photo_url, description, service_videos(id, platform, video_id, position)")
    .eq("presta_id", presta.id)
    .eq("is_active", true)
    .order("price")
    .order("position", { referencedTable: "service_videos" });

  // Supabase renvoie la relation sous le nom de la table ("service_videos") ;
  // on la reformate en "videos" pour matcher le type Service côté client.
  const servicesWithVideos = (services ?? []).map((s) => {
    const { service_videos, ...rest } = s as typeof s & { service_videos: unknown };
    return { ...rest, videos: service_videos };
  });

  return <BookingFlow presta={presta} services={servicesWithVideos} />;
}
