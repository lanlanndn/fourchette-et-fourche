// Crée le bucket Supabase privé "bordereaux" (une seule fois).
// Exécution : node --env-file=.env.local scripts/creer-bucket-bordereaux.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !cle) {
  console.error("Variables NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes.");
  process.exit(1);
}

const supabase = createClient(url, cle, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await supabase.storage.createBucket("bordereaux", {
  public: false,
  fileSizeLimit: 10 * 1024 * 1024,
});

if (error && !String(error.message).toLowerCase().includes("already exists")) {
  console.error("Erreur création bucket :", error.message);
  process.exit(1);
}

console.log("Bucket privé 'bordereaux' prêt (ou déjà existant).");
