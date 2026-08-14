// Outil de maintenance : supprime les factures d'une ou plusieurs commandes
// (rows + fichiers) pour permettre leur régénération avec le code à jour.
// Exécution : node --env-file=.env.local scripts/regenerer-factures.mjs <orderId> [<orderId>…]
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const orderIds = process.argv.slice(2);
if (orderIds.length === 0) {
  console.error("Usage : node --env-file=.env.local scripts/regenerer-factures.mjs <orderId> [<orderId>…]");
  process.exit(1);
}

const MDP = new URL(process.env.DATABASE_URL).password;
const POOLER = `postgresql://postgres.tnwefomjxcbsallmcsvf:${MDP}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require`;
const prisma = new PrismaClient({ datasources: { db: { url: POOLER } } });
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

for (const orderId of orderIds) {
  const factures = await prisma.invoice.findMany({ where: { orderId } });
  console.log(`\nCommande ${orderId} — factures :`, factures.length ? factures.map((f) => f.numero).join(", ") : "(aucune)");

  for (const f of factures) {
    if (f.storagePath) {
      const { error } = await admin.storage.from("factures").remove([f.storagePath]);
      if (error) console.error("Erreur suppression fichier :", error.message);
      else console.log("Fichier supprimé :", f.storagePath);
    }
    await prisma.invoice.delete({ where: { id: f.id } });
    console.log("Enregistrement supprimé :", f.numero);
  }
}

await prisma.$disconnect();
console.log("\nTerminé — dites à Claude de relancer la génération.");
