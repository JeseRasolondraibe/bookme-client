import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import BookingFlow from "@/components/BookingFlow";

export default async function PrestaPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: presta } = await supabase
    .from("prestas")
    .select("id, slug, name, bio, avatar_url, is_active")
    .eq("slug", params.slug)
    .single();

  if (!presta || !presta.is_active) notFound();

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_min, price")
    .eq("presta_id", presta.id)
    .eq("is_active", true)
    .order("price");

  return <BookingFlow presta={presta} services={services ?? []} />;
}
