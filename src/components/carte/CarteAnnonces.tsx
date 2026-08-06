"use client";

import dynamic from "next/dynamic";

// La carte utilise Leaflet, qui a besoin du navigateur :
// on la charge côté client uniquement (pas de rendu serveur).
const CarteAnnoncesInner = dynamic(() => import("./CarteAnnoncesInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-80 items-center justify-center rounded-2xl border border-creme-fonce bg-foret-pale/30 text-sm text-brun-clair">
      🗺️ Chargement de la carte…
    </div>
  ),
});

export default function CarteAnnonces(
  props: React.ComponentProps<typeof CarteAnnoncesInner>,
) {
  return <CarteAnnoncesInner {...props} />;
}
