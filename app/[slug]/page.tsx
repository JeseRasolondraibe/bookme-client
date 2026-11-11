import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import BookingFlow from "@/components/BookingFlow";

export default async function PrestaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: presta } = await supabase
    .from("prestas")
    .select("id, slug, name, bio, avatar_url, phone, address, instagram, tiktok, website, other_link, is_active, trial_ends_at, booking_horizon_months, booking_horizon_date")
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
      <main className="flex-1 bg-stone-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-stone-900">{presta.name}</h1>
          <p className="text-sm text-stone-600 mt-3">
            La réservation en ligne est momentanément indisponible.
          </p>
          {presta.phone ? (
            <a href={`tel:${presta.phone}`}
              className="mt-6 inline-block w-full bg-accent-600 hover:bg-accent-700 text-white font-medium py-3.5 rounded-xl">
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
