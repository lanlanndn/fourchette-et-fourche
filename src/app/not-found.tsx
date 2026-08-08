import Link from "next/link";
import type { Metadata } from "next";
import { IconeFourche } from "@/components/icones";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* Médaillon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-sm border-2 border-encre bg-ocre/25">
        <IconeFourche className="h-14 w-14 text-encre" />
      </div>

      <h1 className="mt-8 font-affiche text-6xl text-outremer tracking-wide uppercase md:text-8xl">
        404
      </h1>

      <p className="mt-4 font-affiche text-2xl text-encre uppercase">
        Page introuvable
      </p>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-encre-doux">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
        Ce n&apos;est pas le bon chemin pour trouver des bons produits —
        mais celui-ci l&apos;est&nbsp;!
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/annonces"
          className="relief rounded-sm border-2 border-encre bg-garance px-6 py-3 font-texte text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce"
        >
          Voir les annonces
        </Link>
        <Link
          href="/"
          className="rounded-sm border-2 border-encre bg-platre px-6 py-3 text-sm font-bold text-encre uppercase transition-all hover:-translate-y-0.5 hover:bg-platre-fonce"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
