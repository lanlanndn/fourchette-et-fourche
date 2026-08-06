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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-brun">
          Les annonces <span className="text-foret">· {zone}</span>
        </h1>
        <p className="mt-1 text-sm text-brun-clair">
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

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
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
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-creme-fonce bg-white p-8 text-center">
              <p className="text-4xl">🧺</p>
              <p className="mt-4 font-semibold text-brun">
                Aucune annonce ici pour le moment
              </p>
              <p className="mt-1 text-sm text-brun-clair">
                Essaie une autre région, un autre département ou une autre
                catégorie.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
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
