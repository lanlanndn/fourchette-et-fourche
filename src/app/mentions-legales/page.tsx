import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-brun">Mentions légales</h1>
      <div className="mt-6 space-y-4 rounded-xl border border-terre-pale bg-terre-pale/30 p-6 text-sm text-brun">
        <p className="font-semibold">
          ⚠️ Gabarit temporaire — à compléter avant la mise en ligne publique.
        </p>
        <p>
          Cette page devra contenir : l&apos;identité de l&apos;éditeur du site
          (nom, prénom / raison sociale, adresse, SIRET), le directeur de la
          publication, les coordonnées de l&apos;hébergeur (Vercel Inc.), et
          les modalités de contact.
        </p>
        <p>
          Claude peut générer un gabarit complet à partir de tes informations —
          demande-le simplement, puis fais valider le résultat par un
          professionnel du droit.
        </p>
      </div>
    </div>
  );
}
