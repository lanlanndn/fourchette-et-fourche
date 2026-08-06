import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-affiche text-4xl text-encre uppercase">
        Mentions légales
      </h1>
      <div className="relief-doux mt-8 space-y-4 border-2 border-encre bg-ocre/15 p-6 text-sm leading-relaxed text-encre">
        <p className="font-bold">
          Gabarit temporaire — à compléter avant la mise en ligne publique.
        </p>
        <p>
          Cette page devra contenir : l&apos;identité de l&apos;éditeur du site
          (nom, prénom / raison sociale, adresse, SIRET), le directeur de la
          publication, les coordonnées de l&apos;hébergeur (Vercel Inc.), et
          les modalités de contact.
        </p>
        <p>
          Claude peut générer un gabarit complet à partir de vos informations —
          demandez-le simplement, puis faites valider le résultat par un
          professionnel du droit.
        </p>
      </div>
    </div>
  );
}
