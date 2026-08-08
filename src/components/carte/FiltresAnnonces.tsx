"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/constantes";
import { DEPARTEMENTS } from "@/lib/geo-metadata";
import BoutonAutourDeMoi from "./BoutonAutourDeMoi";

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
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  function naviguer(cle: string, valeur?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lat");
    params.delete("lng");
    params.delete("rayon");
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

  const aDesFiltres = !!(categorie || departement || recherche || searchParams.has("lat"));

  return (
    <div className="relief-doux border-2 border-encre bg-platre-fonce/60">
      {/* Barre toujours visible : recherche + bouton mobile */}
      <div className="flex items-center gap-2 p-3">
        <form onSubmit={rechercher} className="flex min-w-0 flex-1 gap-2">
          <input
            type="search"
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder="Tomates, miel, ferme…"
            className="champ focus:champ-focus"
          />
          <button
            type="submit"
            className="hidden rounded-sm border-2 border-encre bg-garance px-4 py-2 text-sm font-bold tracking-wide text-platre uppercase transition-colors hover:bg-garance-fonce sm:block"
          >
            Chercher
          </button>
        </form>
        <button
          type="button"
          onClick={() => setFiltresOuverts(!filtresOuverts)}
          className="rounded-sm border-2 border-encre bg-[#fbf7ec] px-3 py-2 text-sm font-bold text-encre transition-colors hover:bg-platre-fonce sm:hidden"
        >
          {filtresOuverts ? "✕ Fermer" : "Filtres"}
        </button>
        {aDesFiltres && (
          <button
            onClick={() => router.push("/annonces")}
            className="hidden rounded-sm border-2 border-encre bg-platre px-3 py-2 text-sm font-bold text-garance transition-colors hover:bg-platre-fonce sm:block"
          >
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {/* Ligne des filtres avancés */}
      <div
        className={`flex flex-wrap items-center gap-3 border-t-2 border-encre/15 px-3 pb-3 pt-3 ${
          filtresOuverts ? "block" : "hidden sm:flex"
        }`}
      >
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

        {/* Autour de moi */}
        <BoutonAutourDeMoi />

        {/* Réinitialiser (mobile) */}
        {aDesFiltres && (
          <button
            onClick={() => router.push("/annonces")}
            className="rounded-sm border-2 border-encre bg-platre px-3 py-2 text-sm font-bold text-garance transition-colors hover:bg-platre-fonce sm:hidden"
          >
            ✕ Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
