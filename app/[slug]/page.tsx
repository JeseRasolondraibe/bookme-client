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
    .select("id, name, duration_min, price, photo_url, description")
    .eq("presta_id", presta.id)
    .eq("is_active", true)
    .order("price");

  return <BookingFlow presta={presta} services={services ?? []} />;
}
