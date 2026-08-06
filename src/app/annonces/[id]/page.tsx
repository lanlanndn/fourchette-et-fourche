import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnnonce, estModeDemo } from "@/lib/donnees";
import {
  CATEGORIES,
  COULEURS_CATEGORIES,
  UNITES,
  formaterPrix,
} from "@/lib/constantes";
import { nomDepartement } from "@/lib/geo-metadata";
import PlaqueDepartement from "@/components/PlaqueDepartement";
import { IconeFourche } from "@/components/icones";

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
  const encre_cat = COULEURS_CATEGORIES[annonce.category] ?? {
    fond: "#6b5f4e",
    texte: "#f1eada",
  };
  const demo = estModeDemo();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/annonces"
        className="etiquette text-encre-doux transition-colors hover:text-garance"
      >
        ← Retour aux annonces
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-5">
        {/* La grande plaque catégorie */}
        <div className="lg:col-span-3">
          <div
            className="grain grain-mur coins-clairs relative flex h-72 flex-col items-center justify-center gap-4 border-2 border-encre md:h-96"
            style={{ backgroundColor: encre_cat.fond, color: encre_cat.texte }}
          >
            <span className="ombre-lettre-plaque font-affiche text-6xl leading-none tracking-wide uppercase md:text-8xl">
              {cat.label}
            </span>
            <PlaqueDepartement code={annonce.departement} className="!text-sm" />
          </div>
          <div className="relief-doux mt-5 border-2 border-encre bg-[#fbf7ec] p-6">
            <h2 className="etiquette text-encre-doux">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-encre">
              {annonce.description}
            </p>
          </div>
        </div>

        {/* Informations */}
        <div className="space-y-5 lg:col-span-2">
          <div className="relief border-2 border-encre bg-[#fbf7ec] p-6">
            <span
              className="etiquette inline-block rounded-sm border-2 border-encre px-2 py-1"
              style={{ backgroundColor: encre_cat.fond, color: encre_cat.texte }}
            >
              {cat.label}
            </span>
            <h1 className="mt-4 font-affiche text-3xl leading-tight text-encre">
              {annonce.title}
            </h1>

            <p className="prix-peint mt-5 text-5xl text-garance">
              {formaterPrix(annonce.priceCents)}
              <span className="font-texte text-sm font-medium text-encre-doux">
                {" "}
                / {UNITES[annonce.unit] ?? annonce.unit}
              </span>
            </p>

            <dl className="mt-5 space-y-2 border-t-2 border-encre/15 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <dt className="etiquette w-16 shrink-0 text-encre-doux">Stock</dt>
                <dd className="font-medium text-encre">
                  {annonce.quantityAvailable}{" "}
                  {UNITES[annonce.unit] ?? annonce.unit}(s) disponible(s)
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="etiquette w-16 shrink-0 text-encre-doux">Lieu</dt>
                <dd className="flex items-center gap-2 font-medium text-encre">
                  {annonce.city} — {nomDepartement(annonce.departement)}
                  <PlaqueDepartement code={annonce.departement} />
                </dd>
              </div>
            </dl>

            {annonce.certifications.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {annonce.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="-rotate-1 rounded-xs border border-verdigris px-2 py-0.5 text-xs font-bold tracking-wider text-verdigris uppercase"
                  >
                    {cert === "BIO" ? "Bio" : cert.replace("_", " ")}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-7 space-y-2.5">
              <button
                className="relief w-full rounded-sm border-2 border-encre bg-garance px-6 py-3.5 font-texte text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                disabled={demo}
                title={demo ? "Disponible après l'activation des comptes" : undefined}
              >
                Commander
              </button>
              <button
                className="w-full rounded-sm border-2 border-encre bg-platre px-6 py-3.5 font-texte text-sm font-bold tracking-wide text-encre uppercase transition-all hover:-translate-y-0.5 hover:bg-platre-fonce hover:shadow-[4px_4px_0_0_rgb(40_34_27/0.35)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                disabled={demo}
                title={demo ? "Disponible après l'activation des comptes" : undefined}
              >
                Contacter le producteur
              </button>
              {demo && (
                <p className="pt-1 text-center text-xs text-encre-doux">
                  Mode démo : la commande et la messagerie seront activées avec
                  les vrais comptes.
                </p>
              )}
            </div>
          </div>

          {/* Carte producteur */}
          <Link
            href={`/producteurs/${annonce.producer.id}`}
            className="relief-doux block border-2 border-encre bg-[#fbf7ec] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgb(40_34_27/0.6)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 border-encre bg-ocre/25 text-encre">
                <IconeFourche className="h-8 w-8" />
              </div>
              <div>
                <p className="font-affiche text-xl leading-tight text-encre">
                  {annonce.producer.displayName}
                </p>
                <p className="mt-0.5 text-sm text-encre-doux">
                  {annonce.producer.city} ({annonce.producer.departement})
                </p>
              </div>
            </div>
            {annonce.producer.bio && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-encre-doux">
                {annonce.producer.bio}
              </p>
            )}
            <p className="etiquette mt-4 text-garance">
              Voir toutes ses annonces →
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
