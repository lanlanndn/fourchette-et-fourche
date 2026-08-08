import type { Metadata } from "next";
import Link from "next/link";
import { listerProducteurs } from "@/lib/donnees";
import PlaqueDepartement from "@/components/PlaqueDepartement";
import { IconeFourche } from "@/components/icones";

export const metadata: Metadata = {
  title: "Producteurs",
  description: "Découvrez les producteurs locaux près de chez vous. Maraîchers, éleveurs, fromagers, vignerons… tous passionnés et engagés pour une agriculture de qualité.",
};

export default async function ProducteursPage() {
  const producteurs = await listerProducteurs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-affiche text-4xl text-encre uppercase md:text-5xl">
        Les producteurs
      </h1>
      <p className="mt-2 text-sm font-medium text-encre-doux">
        {producteurs.length} producteur{producteurs.length > 1 ? "s" : ""}{" "}
        partout en France
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {producteurs.map((prod) => (
          <Link
            key={prod.id}
            href={`/producteurs/${prod.id}`}
            className="relief-doux border-2 border-encre bg-[#fbf7ec] p-6 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_rgb(40_34_27/0.9)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border-2 border-encre bg-ocre/25 text-encre">
                <IconeFourche className="h-8 w-8" />
              </div>
              <div>
                <h2 className="font-affiche text-xl leading-tight text-encre">
                  {prod.displayName}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-encre-doux">
                  {prod.city}
                  {prod.departement && (
                    <PlaqueDepartement code={prod.departement} />
                  )}
                </p>
              </div>
            </div>

            {prod.bio && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-encre-doux">
                {prod.bio}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-2 border-t-2 border-encre/10 pt-3">
              <div className="flex flex-wrap gap-1">
                {prod.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="-rotate-1 rounded-xs border border-verdigris px-1.5 py-px text-[10px] font-bold tracking-wider text-verdigris uppercase"
                  >
                    {cert === "BIO" ? "Bio" : cert.replace("_", " ")}
                  </span>
                ))}
              </div>
              <span className="etiquette shrink-0 text-garance">
                {prod.listings.length} annonce
                {prod.listings.length > 1 ? "s" : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
