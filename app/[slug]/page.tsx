import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import BookingFlow from "@/components/BookingFlow";

export default async function PrestaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: presta } = await supabase
    .from("prestas")
    .select("id, slug, name, bio, avatar_url, phone, address, instagram, tiktok, website, other_link, is_active, trial_ends_at")
    .eq("slug", slug)
    .single();

  const inTrial = presta?.trial_ends_at
    ? new Date(presta.trial_ends_at) > new Date()
    : false;

  if (!presta || (!presta.is_active && !inTrial)) notFound();

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
