"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Circle,
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
  color: "#1e3f8c",
  weight: 1.5,
  fillColor: "#1e3f8c",
  fillOpacity: 0.08,
};

const styleDepartement = {
  color: "#1e3f8c",
  weight: 1.5,
  fillColor: "#1e3f8c",
  fillOpacity: 0.07,
};

const styleDepartementSelectionne = {
  color: "#93290f",
  weight: 2.5,
  fillColor: "#b93a1d",
  fillOpacity: 0.3,
};

const styleSurvol = { fillOpacity: 0.38 };

// ---------- Sous-composant : ajuste la vue quand la sélection change ----------

function GestionVue({
  regionsGeo,
  depsGeo,
  regionSelectionnee,
  departementSelectionne,
  centre,
}: {
  regionsGeo: FeatureCollection | null;
  depsGeo: FeatureCollection | null;
  regionSelectionnee?: string;
  departementSelectionne?: string;
  centre?: { lat: number; lng: number; rayon: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (centre) {
      // Ajuster le zoom pour voir le cercle entier
      const rayonMetres = centre.rayon * 1000;
      map.fitBounds(
        L.latLng(centre.lat, centre.lng).toBounds(rayonMetres * 2.2),
        { padding: [24, 24], maxZoom: 13 },
      );
      return;
    }
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
  }, [map, regionsGeo, depsGeo, regionSelectionnee, departementSelectionne, centre]);

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

  // Centre de recherche (filtre par distance)
  const centreLat = searchParams.get("lat");
  const centreLng = searchParams.get("lng");
  const centreRayon = searchParams.get("rayon");
  const aUnCentre = centreLat && centreLng && centreRayon;
  const centre = aUnCentre
    ? { lat: parseFloat(centreLat!), lng: parseFloat(centreLng!), rayon: parseInt(centreRayon!, 10) }
    : null;

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

  // Marqueurs des annonces : petites étiquettes d'étal
  const marqueurs = useMemo(
    () =>
      annonces
        .filter((a) => a.lat && a.lng)
        .map((a) => {
          const cat = CATEGORIES[a.category] ?? CATEGORIES.AUTRE;
          const icone = L.divIcon({
            html: `<div class="etiquette-etal" style="position:relative">${cat.emoji}</div>`,
            className: "",
            iconSize: [30, 38],
            iconAnchor: [15, 38],
          });
          return { annonce: a, icone };
        }),
    [annonces],
  );

  return (
    <div className="relative h-[420px] overflow-hidden rounded-sm border-2 border-encre lg:h-[560px]">
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
          centre={centre}
        />

        {/* Cercle de recherche (filtre par distance) */}
        {centre && (
          <>
            <Circle
              center={[centre.lat, centre.lng]}
              radius={centre.rayon * 1000}
              pathOptions={{
                color: "#1e3f8c",
                fillColor: "#1e3f8c",
                fillOpacity: 0.08,
                weight: 2,
                dashArray: "6 4",
              }}
            />
            <Marker
              position={[centre.lat, centre.lng]}
              icon={L.divIcon({
                html: '<div style="width:12px;height:12px;border-radius:50%;background:#b93a1d;border:2px solid #f1eada;box-shadow:0 0 0 2px #28221b"></div>',
                className: "",
                iconSize: [12, 12],
                iconAnchor: [6, 6],
              })}
            />
          </>
        )}

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
                <span style={{ color: "#b93a1d", fontWeight: 700 }}>
                  {formaterPrix(annonce.priceCents)} /{" "}
                  {UNITES[annonce.unit] ?? annonce.unit}
                </span>
                <br />
                <span style={{ fontSize: 12, color: "#6b5f4e" }}>
                  {annonce.producer.displayName} · {annonce.city}
                </span>
                <br />
                <a
                  href={`/annonces/${annonce.id}`}
                  style={{ color: "#1e3f8c", fontWeight: 700 }}
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
            className="rounded-sm border-2 border-encre bg-[#fbf7ec]/95 px-3 py-1.5 text-xs font-bold tracking-wide text-outremer uppercase shadow-[2px_2px_0_rgb(40_34_27/0.5)] transition-colors hover:bg-platre-fonce"
          >
            ← Toute la France
          </button>
        )}
        {departementSelectionne && (
          <button
            onClick={() => naviguer({ departement: undefined })}
            className="rounded-sm border-2 border-encre bg-[#fbf7ec]/95 px-3 py-1.5 text-xs font-bold tracking-wide text-outremer uppercase shadow-[2px_2px_0_rgb(40_34_27/0.5)] transition-colors hover:bg-platre-fonce"
          >
            ← {nomRegion(regionSelectionnee ?? "")}
          </button>
        )}
        <div className="rounded-sm border-2 border-encre bg-ocre px-3 py-1.5 text-xs font-bold text-encre shadow-[2px_2px_0_rgb(40_34_27/0.5)]">
          {departementSelectionne
            ? nomDepartement(departementSelectionne)
            : regionSelectionnee
              ? `${nomRegion(regionSelectionnee)} — cliquez un département`
              : "Cliquez une région"}
        </div>
      </div>
    </div>
  );
}
