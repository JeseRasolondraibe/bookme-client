import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client pour les pages publiques (page de réservation) : toujours en anon,
// sans les cookies de session. Une presta connectée dans le même navigateur
// ne peut lire, avec sa session, que sa propre ligne de prestas ; la page
// publique doit donc rester anonyme pour afficher n'importe quelle presta.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
}
