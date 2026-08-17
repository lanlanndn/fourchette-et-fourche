// Applique la migration de livraison Mondial Relay (Phase 10) sur la base
// Supabase partagée, puis l'enregistre dans _prisma_migrations
// (procédure manuelle — voir CLAUDE.md §6).
// Idempotent : peut être relancé sans risque.
// Usage : node --env-file=.env.local scripts/appliquer-migration-livraison-mondial-relay.mjs

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const NOM = "20260817150000_livraison_mr";

try {
  // 1) Déjà appliquée ?
  const deja = await prisma.$queryRawUnsafe(
    "SELECT migration_name FROM _prisma_migrations WHERE migration_name = $1",
    NOM,
  );
  if (deja.length > 0) {
    console.log(`Migration ${NOM} déjà enregistrée — rien à faire.`);
  } else {
    // 2) Lire et exécuter le fichier SQL, instruction par instruction
    //    (PostgreSQL refuse plusieurs commandes dans un seul envoi préparé)
    const sql = await readFile(
      new URL(`../prisma/migrations/${NOM}/migration.sql`, import.meta.url),
      "utf8",
    );
    const instructions = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const instruction of instructions) {
      await prisma.$executeRawUnsafe(instruction);
    }
    console.log("Schéma appliqué (poids des annonces + champs livraison).");

    // 3) Enregistrer la migration (checksum = sha256 du fichier)
    const checksum = createHash("sha256").update(sql).digest("hex");
    await prisma.$executeRawUnsafe(
      `INSERT INTO _prisma_migrations
         (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
       VALUES ($1, $2, $3, now(), now(), 1)`,
      NOM,
      checksum,
      NOM,
    );
    console.log(`Migration ${NOM} enregistrée (checksum ${checksum.slice(0, 12)}…).`);
  }

  console.log("Terminé.");
} catch (err) {
  console.error("Erreur :", err.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
