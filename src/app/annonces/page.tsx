import type { Metadata } from "next";
import PageEnConstruction from "@/components/PageEnConstruction";

export const metadata: Metadata = { title: "Annonces" };

export default function AnnoncesPage() {
  return (
    <PageEnConstruction emoji="🥕" titre="Les annonces">
      <p>
        Bientôt ici : toutes les annonces des producteurs, avec la carte
        interactive pour explorer votre région, et des filtres par catégorie,
        distance et certifications.
      </p>
    </PageEnConstruction>
  );
}
