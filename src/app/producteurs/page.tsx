import type { Metadata } from "next";
import PageEnConstruction from "@/components/PageEnConstruction";

export const metadata: Metadata = { title: "Producteurs" };

export default function ProducteursPage() {
  return (
    <PageEnConstruction emoji="🚜" titre="L'annuaire des producteurs">
      <p>
        Bientôt ici : la liste de tous les producteurs inscrits, leurs
        spécialités, leurs certifications et leurs annonces.
      </p>
    </PageEnConstruction>
  );
}
