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
    "rounded-sm border-2 border-encre bg-[#fbf7ec] px-3 py-2 text-sm font-medium text-encre outline-none transition-all focus:border-outremer focus:shadow-[3px_3px_0_0_rgb(30_63_140/0.35)]";

  return (
    <div className="relief-doux flex flex-wrap items-center gap-3 border-2 border-encre bg-platre-fonce/60 p-3">
      {/* Recherche */}
      <form onSubmit={rechercher} className="flex min-w-52 flex-1 gap-2">
        <input
          type="search"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Tomates, miel, ferme…"
          className="champ focus:champ-focus"
        />
        <button
          type="submit"
          className="rounded-sm border-2 border-encre bg-garance px-4 py-2 text-sm font-bold tracking-wide text-platre uppercase transition-colors hover:bg-garance-fonce"
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
            {cat.label}
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
          className="rounded-sm border-2 border-encre bg-platre px-3 py-2 text-sm font-bold text-garance transition-colors hover:bg-platre-fonce"
        >
          ✕ Réinitialiser
        </button>
      )}
    </div>
  );
}
