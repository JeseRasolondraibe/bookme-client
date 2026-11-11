import { createBrowserClient } from "@supabase/ssr";

// Client navigateur (session presta sur la page /abonnement).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://flrtdhzcimbkbcgczmea.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}
