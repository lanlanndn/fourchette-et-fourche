import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateListingAction } from "@/lib/actions/annonces";
import FormulaireAnnonce from "@/components/forms/FormulaireAnnonce";

export const metadata: Metadata = { title: "Modifier l'annonce" };

type Props = { params: Promise<{ id: string }> };

export default async function ModifierAnnoncePage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.producerId !== user.id) notFound();

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
          Modifier l&apos;annonce
        </h1>
        <p className="mt-1 text-sm text-encre-doux">
          Modifie les champs que tu souhaites et enregistre.
        </p>
      </div>

      <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-5 sm:p-7">
        <FormulaireAnnonce
          action={updateListingAction}
          listing={listing}
          adresseProducteur={user.address ?? undefined}
        />
      </div>
    </div>
  );
}
