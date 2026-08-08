"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { suggererAdresses } from "@/lib/geo";

export default function BoutonAutourDeMoi() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [etat, setEtat] = useState<"repos" | "geoloc" | "saisie">("repos");
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState("");
  const [suggestions, setSuggestions] = useState<{ label: string; ville: string }[]>([]);
  const [rayon, setRayon] = useState(30);

  const actif = searchParams.has("lat") && searchParams.has("lng");

  function naviguer(lat?: number, lng?: number, r?: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (lat !== undefined && lng !== undefined) {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
      params.set("rayon", String(r ?? rayon));
    } else {
      params.delete("lat");
      params.delete("lng");
      params.delete("rayon");
    }
    router.push(`/annonces?${params.toString()}`);
  }

  const tenterGeoloc = useCallback(() => {
    if (!navigator.geolocation) {
      setErreur("La géolocalisation n'est pas disponible sur ce navigateur.");
      setEtat("saisie");
      return;
    }
    setEtat("geoloc");
    setErreur("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        naviguer(pos.coords.latitude, pos.coords.longitude);
        setEtat("repos");
      },
      () => {
        setErreur("Géolocalisation refusée. Entre une ville à la place.");
        setEtat("saisie");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [rayon, searchParams]);

  const rechercherAdresses = useCallback(async (q: string) => {
    setRecherche(q);
    if (q.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const resultats = await suggererAdresses(q);
    setSuggestions(resultats);
  }, []);

  const selectionnerSuggestion = useCallback(
    async (label: string) => {
      setRecherche(label);
      setSuggestions([]);
      // Géocoder l'adresse sélectionnée
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(label)}&limit=1`;
      try {
        const rep = await fetch(url);
        const data = await rep.json();
        const coords = data.features?.[0]?.geometry?.coordinates;
        if (coords) {
          naviguer(coords[1], coords[0]);
          setEtat("repos");
          setErreur("");
        } else {
          setErreur("Adresse introuvable. Essaie avec le code postal.");
        }
      } catch {
        setErreur("Impossible de localiser cette adresse.");
      }
    },
    [rayon, searchParams],
  );

  const RAYONS = [5, 10, 20, 30, 50, 100];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!actif ? (
        <>
          {etat === "repos" && (
            <button
              type="button"
              onClick={tenterGeoloc}
              className="flex items-center gap-1.5 rounded-sm border-2 border-encre bg-outremer px-3 py-2 text-sm font-bold tracking-wide text-platre transition-all hover:-translate-y-0.5 hover:bg-outremer-nuit"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="8" cy="8" r="3" />
                <line x1="8" y1="1" x2="8" y2="4" />
                <line x1="8" y1="12" x2="8" y2="15" />
                <line x1="1" y1="8" x2="4" y2="8" />
                <line x1="12" y1="8" x2="15" y2="8" />
              </svg>
              Autour de moi
            </button>
          )}

          {etat === "geoloc" && (
            <span className="rounded-sm border-2 border-encre bg-ocre/30 px-3 py-2 text-sm font-medium text-encre">
              Localisation en cours…
            </span>
          )}

          {etat === "saisie" && (
            <div className="flex flex-wrap items-center gap-2">
              {erreur && (
                <span className="text-xs font-medium text-garance">{erreur}</span>
              )}
              <div className="relative">
                <input
                  type="search"
                  value={recherche}
                  onChange={(e) => rechercherAdresses(e.target.value)}
                  placeholder="Ville ou code postal…"
                  className="champ focus:champ-focus text-sm"
                  autoFocus
                />
                {suggestions.length > 0 && (
                  <ul className="absolute left-0 top-full z-50 mt-1 max-h-48 w-72 overflow-y-auto border-2 border-encre bg-[#fbf7ec]">
                    {suggestions.map((s, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => selectionnerSuggestion(s.label)}
                          className="w-full cursor-pointer px-3 py-2 text-left text-sm text-encre transition-colors hover:bg-platre-fonce"
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setEtat("repos"); setErreur(""); setSuggestions([]); }}
                className="rounded-sm border-2 border-encre bg-platre px-2 py-2 text-xs font-bold text-encre-doux transition-colors hover:bg-platre-fonce"
              >
                Annuler
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={rayon}
            onChange={(e) => {
              const r = Number(e.target.value);
              setRayon(r);
              const params = new URLSearchParams(searchParams.toString());
              params.set("rayon", String(r));
              router.push(`/annonces?${params.toString()}`);
            }}
            className="champ focus:champ-focus text-sm"
            aria-label="Rayon de recherche"
          >
            {RAYONS.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => naviguer()}
            className="rounded-sm border-2 border-encre bg-platre px-3 py-2 text-sm font-bold text-garance transition-colors hover:bg-platre-fonce"
          >
            ✕ Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
