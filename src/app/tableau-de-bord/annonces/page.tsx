import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, COULEURS_CATEGORIES, UNITES, formaterPrix } from "@/lib/constantes";
import { toggleListingAction } from "@/lib/actions/annonces";

export const metadata: Metadata = { title: "Mes annonces" };

export default async function MesAnnoncesPage() {
  const user = await requireUser();
  if (user.role !== "PRODUCTEUR") {
    return (
      <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-8 text-center">
        <p className="font-affiche text-2xl text-encre uppercase">
          Réservé aux producteurs
        </p>
        <p className="mt-2 text-sm text-encre-doux">
          Seuls les producteurs peuvent publier des annonces.
        </p>
      </div>
    );
  }

  const annonces = await prisma.listing.findMany({
    where: { producerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-affiche text-3xl text-encre uppercase">
            Mes annonces
          </h1>
          <p className="mt-1 text-sm text-encre-doux">
            {annonces.length} annonce{annonces.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/tableau-de-bord/annonces/nouvelle"
          className="relief inline-block rounded-sm border-2 border-encre bg-garance px-5 py-2.5 text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce"
        >
          + Nouvelle annonce
        </Link>
      </div>

      {/* Liste */}
      {annonces.length === 0 ? (
        <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-10 text-center">
          <p className="font-affiche text-2xl text-encre uppercase">
            Aucune annonce pour le moment
          </p>
          <p className="mt-2 text-sm text-encre-doux">
            Publiez votre première annonce pour apparaître sur la carte et
            attirer les restaurateurs de votre région.
          </p>
          <Link
            href="/tableau-de-bord/annonces/nouvelle"
            className="mt-5 inline-block rounded-sm border-2 border-encre bg-garance px-6 py-3 font-texte text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce"
          >
            Publier ma première annonce
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {annonces.map((annonce) => {
            const cat = CATEGORIES[annonce.category] ?? CATEGORIES.AUTRE;
            const encre_cat = COULEURS_CATEGORIES[annonce.category] ?? {
              fond: "#6b5f4e",
              texte: "#f1eada",
            };

            return (
              <div
                key={annonce.id}
                className={`flex flex-col gap-4 border-2 border-encre bg-[#fbf7ec] relief-doux p-4 sm:flex-row sm:items-center ${
                  !annonce.isActive ? "opacity-60" : ""
                }`}
              >
                {/* Plaque catégorie */}
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border-2 border-encre/20"
                  style={{
                    backgroundColor: encre_cat.fond,
                    color: encre_cat.texte,
                  }}
                >
                  <span className="font-affiche text-xs leading-tight tracking-wide uppercase">
                    {cat.label}
                  </span>
                </div>

                {/* Infos */}
                <div className="min-w-0 flex-1">
                  <h2 className="font-affiche text-lg leading-snug text-encre">
                    {annonce.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-encre-doux">
                    {formaterPrix(annonce.priceCents)} /{" "}
                    {UNITES[annonce.unit] ?? annonce.unit}{" "}
                    · {annonce.quantityAvailable} dispo.
                    {!annonce.isActive && (
                      <span className="ml-2 font-bold text-garance">
                        (désactivée)
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/tableau-de-bord/annonces/${annonce.id}/modifier`}
                    className="rounded-sm border-2 border-encre bg-platre px-3 py-1.5 text-xs font-bold text-encre uppercase transition-colors hover:bg-platre-fonce"
                  >
                    Modifier
                  </Link>
                  <form action={toggleListingAction.bind(null, annonce.id)}>
                    <button
                      type="submit"
                      className={`rounded-sm border-2 border-encre px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                        annonce.isActive
                          ? "bg-ocre/30 text-encre hover:bg-ocre/50"
                          : "bg-verdigris text-platre hover:bg-verdigris/80"
                      }`}
                    >
                      {annonce.isActive ? "Désactiver" : "Activer"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
