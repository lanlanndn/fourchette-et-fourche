"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/constantes";
import { DEPARTEMENTS } from "@/lib/geo-metadata";

// Barre de filtres au-dessus de la liste des annonces
export default function FiltresAnnonces({
  categorie,
  departement,
  recherche,
}: {
  categorie?: string;
  departement?: string;
  recherche?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [texte, setTexte] = useState(recherche ?? "");

  function naviguer(cle: string, valeur?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valeur) params.set(cle, valeur);
    else params.delete(cle);
    router.push(`/annonces?${params.toString()}`);
  }

  function rechercher(e: React.FormEvent) {
    e.preventDefault();
    naviguer("q", texte.trim() || undefined);
  }

  const departementsTries = [...DEPARTEMENTS].sort((a, b) =>
    a.nom.localeCompare(b.nom, "fr"),
  );

  const classeSelect =
    "rounded-lg border border-creme-fonce bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-foret";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-creme-fonce bg-white p-3">
      {/* Recherche */}
      <form onSubmit={rechercher} className="flex min-w-52 flex-1 gap-2">
        <input
          type="search"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="🔍 Tomates, miel, ferme…"
          className="w-full rounded-lg border border-creme-fonce bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-foret"
        />
        <button
          type="submit"
          className="rounded-lg bg-foret px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-foret-clair"
        >
          Chercher
        </button>
      </form>

      {/* Catégorie */}
      <select
        value={categorie ?? ""}
        onChange={(e) => naviguer("categorie", e.target.value || undefined)}
        className={classeSelect}
        aria-label="Filtrer par catégorie"
      >
        <option value="">Toutes catégories</option>
        {Object.entries(CATEGORIES).map(([code, cat]) => (
          <option key={code} value={code}>
            {cat.emoji} {cat.label}
          </option>
        ))}
      </select>

      {/* Département */}
      <select
        value={departement ?? ""}
        onChange={(e) => naviguer("departement", e.target.value || undefined)}
        className={classeSelect}
        aria-label="Filtrer par département"
      >
        <option value="">Tous départements</option>
        {departementsTries.map((dep) => (
          <option key={dep.code} value={dep.code}>
            {dep.code} — {dep.nom}
          </option>
        ))}
      </select>

      {(categorie || departement || recherche) && (
        <button
          onClick={() => router.push("/annonces")}
          className="rounded-lg px-3 py-2 text-sm font-medium text-terre transition-colors hover:bg-terre-pale"
        >
          ✕ Réinitialiser
        </button>
      )}
    </div>
  );
}
