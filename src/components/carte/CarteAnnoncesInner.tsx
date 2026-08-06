"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Feature, FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";

import type { AnnonceAvecProducteur } from "@/lib/donnees/types";
import { CATEGORIES, UNITES, formaterPrix } from "@/lib/constantes";
import { DEPARTEMENTS, nomDepartement, nomRegion } from "@/lib/geo-metadata";

type Props = {
  annonces: AnnonceAvecProducteur[];
  regionSelectionnee?: string;
  departementSelectionne?: string;
};

// ---------- Styles de la carte ----------

const styleRegion = {
  color: "#2f5d3a",
  weight: 1.5,
  fillColor: "#4c8a5c",
  fillOpacity: 0.15,
};

const styleDepartement = {
  color: "#2f5d3a",
  weight: 1.5,
  fillColor: "#4c8a5c",
  fillOpacity: 0.12,
};

const styleDepartementSelectionne = {
  color: "#b8552f",
  weight: 2.5,
  fillColor: "#d96c47",
  fillOpacity: 0.35,
};

const styleSurvol = { fillOpacity: 0.45 };

// ---------- Sous-composant : ajuste la vue quand la sélection change ----------

function GestionVue({
  regionsGeo,
  depsGeo,
  regionSelectionnee,
  departementSelectionne,
}: {
  regionsGeo: FeatureCollection | null;
  depsGeo: FeatureCollection | null;
  regionSelectionnee?: string;
  departementSelectionne?: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (departementSelectionne && depsGeo) {
      const dep = depsGeo.features.find(
        (f) => f.properties?.code === departementSelectionne,
      );
      if (dep) {
        map.fitBounds(L.geoJSON(dep).getBounds(), { padding: [24, 24] });
        return;
      }
    }
    if (regionSelectionnee && regionsGeo) {
      const region = regionsGeo.features.find(
        (f) => f.properties?.code === regionSelectionnee,
      );
      if (region) {
        map.fitBounds(L.geoJSON(region).getBounds(), { padding: [24, 24] });
        return;
      }
    }
    // Vue par défaut : la France entière
    map.setView([46.7, 2.5], 6);
  }, [map, regionsGeo, depsGeo, regionSelectionnee, departementSelectionne]);

  return null;
}

// ---------- La carte ----------

export default function CarteAnnoncesInner({
  annonces,
  regionSelectionnee,
  departementSelectionne,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [regionsGeo, setRegionsGeo] = useState<FeatureCollection | null>(null);
  const [depsGeo, setDepsGeo] = useState<FeatureCollection | null>(null);

  // Charge les contours de France au démarrage
  useEffect(() => {
    fetch("/geojson/regions.geojson")
      .then((r) => r.json())
      .then(setRegionsGeo)
      .catch(() => {});
    fetch("/geojson/departements.geojson")
      .then((r) => r.json())
      .then(setDepsGeo)
      .catch(() => {});
  }, []);

  // Met à jour l'URL (et donc le filtrage) en gardant les autres paramètres
  function naviguer(nouveaux: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [cle, valeur] of Object.entries(nouveaux)) {
      if (valeur) params.set(cle, valeur);
      else params.delete(cle);
    }
    router.push(`/annonces?${params.toString()}`);
  }

  // Départements de la région sélectionnée uniquement
  const depsAffiches = useMemo((): FeatureCollection | null => {
    if (!depsGeo || !regionSelectionnee) return depsGeo;
    const codesDeps = new Set(
      DEPARTEMENTS.filter((d) => d.codeRegion === regionSelectionnee).map(
        (d) => d.code,
      ),
    );
    return {
      type: "FeatureCollection",
      features: depsGeo.features.filter((f) =>
        codesDeps.has(f.properties?.code),
      ),
    };
  }, [depsGeo, regionSelectionnee]);

  // Marqueurs des annonces
  const marqueurs = useMemo(
    () =>
      annonces
        .filter((a) => a.lat && a.lng)
        .map((a) => {
          const cat = CATEGORIES[a.category] ?? CATEGORIES.AUTRE;
          const icone = L.divIcon({
            html: `<div style="font-size:26px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))">${cat.emoji}</div>`,
            className: "",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });
          return { annonce: a, icone };
        }),
    [annonces],
  );

  return (
    <div className="relative h-full min-h-80 overflow-hidden rounded-2xl border border-creme-fonce lg:min-h-[560px]">
      <MapContainer
        center={[46.7, 2.5]}
        zoom={6}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GestionVue
          regionsGeo={regionsGeo}
          depsGeo={depsGeo}
          regionSelectionnee={regionSelectionnee}
          departementSelectionne={departementSelectionne}
        />

        {/* Contours des régions (France entière) */}
        {!regionSelectionnee && regionsGeo && (
          <GeoJSON
            key="regions"
            data={regionsGeo}
            style={() => styleRegion}
            onEachFeature={(feature: Feature, layer) => {
              const code = feature.properties?.code;
              const nom = feature.properties?.nom;
              layer.bindTooltip(nom, { sticky: true });
              layer.on({
                click: () =>
                  naviguer({ region: code, departement: undefined }),
                mouseover: (e) => e.target.setStyle(styleSurvol),
                mouseout: (e) =>
                  e.target.setStyle({ fillOpacity: styleRegion.fillOpacity }),
              });
            }}
          />
        )}

        {/* Contours des départements (région sélectionnée ou survol) */}
        {regionSelectionnee && depsAffiches && (
          <GeoJSON
            key={`deps-${regionSelectionnee}-${departementSelectionne ?? "aucun"}`}
            data={depsAffiches}
            style={(feature) =>
              feature?.properties?.code === departementSelectionne
                ? styleDepartementSelectionne
                : styleDepartement
            }
            onEachFeature={(feature: Feature, layer) => {
              const code = feature.properties?.code;
              layer.bindTooltip(feature.properties?.nom, { sticky: true });
              layer.on({
                click: () => naviguer({ departement: code }),
                mouseover: (e) => e.target.setStyle(styleSurvol),
                mouseout: (e) =>
                  e.target.setStyle({
                    fillOpacity:
                      code === departementSelectionne
                        ? styleDepartementSelectionne.fillOpacity
                        : styleDepartement.fillOpacity,
                  }),
              });
            }}
          />
        )}

        {/* Marqueurs des annonces */}
        {marqueurs.map(({ annonce, icone }) => (
          <Marker
            key={annonce.id}
            position={[annonce.lat, annonce.lng]}
            icon={icone}
          >
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong>{annonce.title}</strong>
                <br />
                <span style={{ color: "#2f5d3a", fontWeight: 700 }}>
                  {formaterPrix(annonce.priceCents)} /{" "}
                  {UNITES[annonce.unit] ?? annonce.unit}
                </span>
                <br />
                <span style={{ fontSize: 12, color: "#7a6a62" }}>
                  {annonce.producer.displayName} · {annonce.city}
                </span>
                <br />
                <a
                  href={`/annonces/${annonce.id}`}
                  style={{ color: "#d96c47", fontWeight: 600 }}
                >
                  Voir l&apos;annonce →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Boutons de navigation au-dessus de la carte */}
      <div className="absolute left-3 top-3 z-[1000] flex flex-col items-start gap-2">
        {(regionSelectionnee || departementSelectionne) && (
          <button
            onClick={() =>
              naviguer({ region: undefined, departement: undefined })
            }
            className="rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-foret shadow-md transition-colors hover:bg-foret-pale"
          >
            ← Toute la France
          </button>
        )}
        {departementSelectionne && (
          <button
            onClick={() => naviguer({ departement: undefined })}
            className="rounded-full bg-white/95 px-4 py-1.5 text-xs font-semibold text-foret shadow-md transition-colors hover:bg-foret-pale"
          >
            ← {nomRegion(regionSelectionnee ?? "")}
          </button>
        )}
        <div className="rounded-lg bg-white/95 px-3 py-1.5 text-xs text-brun-clair shadow-md">
          {departementSelectionne
            ? `📍 ${nomDepartement(departementSelectionne)}`
            : regionSelectionnee
              ? `📍 ${nomRegion(regionSelectionnee)} — clique sur un département`
              : "🗺️ Clique sur une région"}
        </div>
      </div>
    </div>
  );
}
