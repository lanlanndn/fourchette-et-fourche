// Applique la migration de livraison (Phase 9) sur la base Supabase partagée,
// puis l'enregistre dans _prisma_migrations (procédure manuelle — voir CLAUDE.md §6).
// Idempotent : peut être relancé sans risque.
// Usage : node --env-file=.env.local scripts/appliquer-migration-livraison.mjs

import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const NOM = "20260817120000_livraison";

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
    console.log("Schéma appliqué (colonnes + enum de livraison).");

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

  // 4) Aligner le nom de la migration facturation sur le dossier local
  const renomme = await prisma.$executeRawUnsafe(
    `UPDATE _prisma_migrations SET migration_name = $1
      WHERE migration_name = $2 AND id = $3`,
    "20260813120000_facturation",
    "facturation",
    "20260813120000_facturation",
  );
  if (renomme > 0) {
    console.log("Historique facturation aligné avec le dossier local.");
  }

  console.log("Terminé.");
} catch (err) {
  console.error("Erreur :", err.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
