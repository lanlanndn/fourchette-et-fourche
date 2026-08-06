import type { Metadata } from "next";
import { Suspense } from "react";
import { listerAnnonces } from "@/lib/donnees";
import { nomDepartement, nomRegion } from "@/lib/geo-metadata";
import CarteAnnonce from "@/components/CarteAnnonce";
import CarteAnnonces from "@/components/carte/CarteAnnonces";
import FiltresAnnonces from "@/components/carte/FiltresAnnonces";

export const metadata: Metadata = { title: "Annonces" };

type Props = {
  searchParams: Promise<{
    categorie?: string;
    departement?: string;
    region?: string;
    q?: string;
  }>;
};

export default async function AnnoncesPage({ searchParams }: Props) {
  const params = await searchParams;
  const filtres = {
    categorie: params.categorie,
    departement: params.departement,
    region: params.region,
    recherche: params.q,
  };
  const annonces = await listerAnnonces(filtres);

  // Petit résumé de la zone sélectionnée
  const zone = params.departement
    ? nomDepartement(params.departement)
    : params.region
      ? nomRegion(params.region)
      : "France entière";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="font-affiche text-4xl text-encre uppercase md:text-5xl">
          Les annonces{" "}
          <span className="text-outremer">· {zone}</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-encre-doux">
          {annonces.length} annonce{annonces.length > 1 ? "s" : ""} de
          producteurs locaux
        </p>
      </div>

      <Suspense>
        <FiltresAnnonces
          categorie={params.categorie}
          departement={params.departement}
          recherche={params.q}
        />
      </Suspense>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Carte interactive */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Suspense>
            <CarteAnnonces
              annonces={annonces}
              regionSelectionnee={params.region}
              departementSelectionne={params.departement}
            />
          </Suspense>
        </div>

        {/* Liste des annonces */}
        <div>
          {annonces.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center border-2 border-encre bg-platre-fonce/50 p-8 text-center">
              <p className="font-affiche text-3xl tracking-wide text-encre uppercase">
                Panier vide
              </p>
              <p className="mt-2 text-sm text-encre-doux">
                Aucune annonce ici pour le moment — essayez une autre région,
                un autre département ou une autre catégorie.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {annonces.map((annonce) => (
                <CarteAnnonce key={annonce.id} annonce={annonce} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
