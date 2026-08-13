// Client Supabase "admin" (service role) — pour le code serveur SANS session
// utilisateur (webhook Stripe, génération de factures, routes API).
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error(
      "Supabase admin non configuré (SUPABASE_SERVICE_ROLE_KEY manquante).",
    );
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
