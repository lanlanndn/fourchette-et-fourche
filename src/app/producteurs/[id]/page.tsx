import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducteur } from "@/lib/donnees";
import { nomDepartement, nomRegion } from "@/lib/geo-metadata";
import CarteAnnonce from "@/components/CarteAnnonce";

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/producteurs"
        className="text-sm font-medium text-brun-clair hover:text-foret"
      >
        ← Tous les producteurs
      </Link>

      {/* En-tête du profil */}
      <div className="mt-4 rounded-2xl border border-creme-fonce bg-white p-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foret-pale text-4xl">
            🚜
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brun">{prod.displayName}</h1>
            <p className="mt-1 text-sm text-brun-clair">
              📍 {prod.city} — {nomDepartement(prod.departement ?? "")},{" "}
              {nomRegion(prod.region ?? "")}
            </p>
            {prod.certifications.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {prod.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="rounded-full bg-foret-pale px-2.5 py-1 text-xs font-semibold text-foret"
                  >
                    {cert === "BIO" ? "🌿 Bio" : `🏅 ${cert.replace("_", " ")}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {prod.bio && (
          <p className="mt-6 border-t border-creme-fonce pt-6 text-sm leading-relaxed text-brun">
            {prod.bio}
          </p>
        )}
      </div>

      {/* Ses annonces */}
      <h2 className="mt-10 font-titre text-2xl font-bold text-brun">
        Ses annonces ({prod.listings.length})
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {annoncesAvecProducteur.map((annonce) => (
          <CarteAnnonce key={annonce.id} annonce={annonce} />
        ))}
      </div>
    </div>
  );
}
