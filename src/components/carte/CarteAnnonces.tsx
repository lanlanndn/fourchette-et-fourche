"use client";

import dynamic from "next/dynamic";

// La carte utilise Leaflet, qui a besoin du navigateur :
// on la charge côté client uniquement (pas de rendu serveur).
const CarteAnnoncesInner = dynamic(() => import("./CarteAnnoncesInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-sm border-2 border-encre bg-platre-fonce/60 lg:h-[560px]">
      <span className="etiquette text-encre-doux">
        Chargement de la carte…
      </span>
    </div>
  ),
});

export default function CarteAnnonces(
  props: React.ComponentProps<typeof CarteAnnoncesInner>,
) {
  return <CarteAnnoncesInner {...props} />;
}
