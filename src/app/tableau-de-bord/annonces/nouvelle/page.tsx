import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createListingAction } from "@/lib/actions/annonces";
import FormulaireAnnonce from "@/components/forms/FormulaireAnnonce";

export const metadata: Metadata = { title: "Nouvelle annonce" };

export default async function NouvelleAnnoncePage() {
  const user = await requireUser();
  if (user.role !== "PRODUCTEUR") {
    return (
      <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-8 text-center">
        <p className="font-affiche text-2xl text-encre uppercase">
          Réservé aux producteurs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/tableau-de-bord/annonces"
        className="etiquette text-encre-doux transition-colors hover:text-garance"
      >
        ← Retour à mes annonces
      </Link>

      <div>
        <h1 className="font-affiche text-3xl text-encre uppercase">
          Nouvelle annonce
        </h1>
        <p className="mt-1 text-sm text-encre-doux">
          Remplis les informations ci-dessous. Ton annonce sera visible par les
          restaurateurs de ta région.
        </p>
      </div>

      <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-5 sm:p-7">
        <FormulaireAnnonce
          action={createListingAction}
          adresseProducteur={user.address ?? undefined}
        />
      </div>
    </div>
  );
}
