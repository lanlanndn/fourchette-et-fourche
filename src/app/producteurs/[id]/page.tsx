import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducteur } from "@/lib/donnees";
import { nomDepartement, nomRegion } from "@/lib/geo-metadata";
import CarteAnnonce from "@/components/CarteAnnonce";
import PlaqueDepartement from "@/components/PlaqueDepartement";
import { IconeFourche } from "@/components/icones";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const prod = await getProducteur(id);
  return { title: prod?.displayName ?? "Producteur" };
}

export default async function ProducteurPublicPage({ params }: Props) {
  const { id } = await params;
  const prod = await getProducteur(id);
  if (!prod) notFound();

  const annoncesAvecProducteur = prod.listings.map((l) => ({
    ...l,
    producer: {
      id: prod.id,
      displayName: prod.displayName,
      city: prod.city,
      departement: prod.departement,
      region: prod.region,
      certifications: prod.certifications,
      bio: prod.bio,
      avatarUrl: prod.avatarUrl,
    },
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/producteurs"
        className="etiquette text-encre-doux transition-colors hover:text-garance"
      >
        ← Tous les producteurs
      </Link>

      {/* En-tête du profil */}
      <div className="relief mt-6 border-2 border-encre bg-[#fbf7ec] p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sm border-2 border-encre bg-ocre/25 text-encre">
            <IconeFourche className="h-11 w-11" />
          </div>
          <div className="flex-1">
            <h1 className="font-affiche text-4xl leading-tight text-encre uppercase">
              {prod.displayName}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-encre-doux">
              {prod.city} — {nomDepartement(prod.departement ?? "")},{" "}
              {nomRegion(prod.region ?? "")}
              {prod.departement && (
                <PlaqueDepartement code={prod.departement} />
              )}
            </p>
            {prod.certifications.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {prod.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="-rotate-1 rounded-xs border border-verdigris px-2 py-0.5 text-xs font-bold tracking-wider text-verdigris uppercase"
                  >
                    {cert === "BIO" ? "Bio" : cert.replace("_", " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {prod.bio && (
          <p className="mt-6 border-t-2 border-encre/10 pt-6 text-sm leading-relaxed text-encre">
            {prod.bio}
          </p>
        )}
      </div>

      {/* Ses annonces */}
      <h2 className="mt-12 font-affiche text-3xl text-encre uppercase">
        Ses annonces{" "}
        <span className="prix-peint text-garance">({prod.listings.length})</span>
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {annoncesAvecProducteur.map((annonce) => (
          <CarteAnnonce key={annonce.id} annonce={annonce} />
        ))}
      </div>
    </div>
  );
}
