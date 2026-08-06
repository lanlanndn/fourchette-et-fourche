import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnnonce, estModeDemo } from "@/lib/donnees";
import { CATEGORIES, UNITES, formaterPrix } from "@/lib/constantes";
import { nomDepartement } from "@/lib/geo-metadata";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const annonce = await getAnnonce(id);
  return { title: annonce?.title ?? "Annonce" };
}

export default async function AnnonceDetailPage({ params }: Props) {
  const { id } = await params;
  const annonce = await getAnnonce(id);
  if (!annonce) notFound();

  const cat = CATEGORIES[annonce.category] ?? CATEGORIES.AUTRE;
  const demo = estModeDemo();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/annonces"
        className="text-sm font-medium text-brun-clair hover:text-foret"
      >
        ← Retour aux annonces
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-5">
        {/* Visuel */}
        <div className="lg:col-span-3">
          <div className="flex h-72 items-center justify-center rounded-2xl bg-gradient-to-br from-foret-pale to-creme-fonce text-9xl md:h-96">
            {cat.emoji}
          </div>
          <div className="mt-4 rounded-2xl border border-creme-fonce bg-white p-6">
            <h2 className="font-titre text-lg font-bold text-brun">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brun">
              {annonce.description}
            </p>
          </div>
        </div>

        {/* Informations */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-creme-fonce bg-white p-6">
            <span className="rounded-full bg-foret-pale px-3 py-1 text-xs font-semibold text-foret">
              {cat.emoji} {cat.label}
            </span>
            <h1 className="mt-3 font-titre text-2xl font-bold text-brun">
              {annonce.title}
            </h1>

            <p className="mt-4 text-3xl font-bold text-foret">
              {formaterPrix(annonce.priceCents)}
              <span className="text-base font-normal text-brun-clair">
                {" "}
                / {UNITES[annonce.unit] ?? annonce.unit}
              </span>
            </p>

            <p className="mt-2 text-sm text-brun-clair">
              📦 {annonce.quantityAvailable} {UNITES[annonce.unit] ?? annonce.unit}
              (s) disponible(s)
            </p>
            <p className="mt-1 text-sm text-brun-clair">
              📍 {annonce.city} — {nomDepartement(annonce.departement)}
            </p>

            {annonce.certifications.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {annonce.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="rounded-full bg-foret-pale px-2.5 py-1 text-xs font-semibold text-foret"
                  >
                    {cert === "BIO" ? "🌿 Bio" : `🏅 ${cert.replace("_", " ")}`}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-2">
              <button
                className="w-full rounded-full bg-terre px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terre-fonce disabled:cursor-not-allowed disabled:opacity-60"
                disabled={demo}
                title={demo ? "Disponible après l'activation des comptes" : undefined}
              >
                🛒 Commander
              </button>
              <button
                className="w-full rounded-full border-2 border-foret px-6 py-3 text-sm font-semibold text-foret transition-colors hover:bg-foret-pale disabled:cursor-not-allowed disabled:opacity-60"
                disabled={demo}
                title={demo ? "Disponible après l'activation des comptes" : undefined}
              >
                💬 Contacter le producteur
              </button>
              {demo && (
                <p className="text-center text-xs text-brun-clair">
                  🎭 Mode démo : la commande et la messagerie seront activées
                  avec les vrais comptes.
                </p>
              )}
            </div>
          </div>

          {/* Carte producteur */}
          <Link
            href={`/producteurs/${annonce.producer.id}`}
            className="block rounded-2xl border border-creme-fonce bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foret-pale text-2xl">
                🚜
              </div>
              <div>
                <p className="font-titre text-lg font-bold text-brun">
                  {annonce.producer.displayName}
                </p>
                <p className="text-sm text-brun-clair">
                  {annonce.producer.city} (
                  {annonce.producer.departement})
                </p>
              </div>
            </div>
            {annonce.producer.bio && (
              <p className="mt-3 line-clamp-3 text-sm text-brun-clair">
                {annonce.producer.bio}
              </p>
            )}
            <p className="mt-3 text-sm font-semibold text-terre">
              Voir toutes ses annonces →
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
