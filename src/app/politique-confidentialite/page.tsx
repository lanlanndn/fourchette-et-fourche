import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-affiche text-4xl text-encre uppercase">
        Politique de confidentialité
      </h1>
      <div className="relief-doux mt-8 space-y-4 border-2 border-encre bg-ocre/15 p-6 text-sm leading-relaxed text-encre">
        <p className="font-bold">
          Gabarit temporaire — à compléter avant l&apos;ouverture des
          inscriptions.
        </p>
        <p>
          Cette page devra décrire : les données collectées (compte, adresse,
          messages, commandes), leurs finalités, la durée de conservation, les
          sous-traitants (Supabase, Stripe, Resend, Vercel), et les droits des
          utilisateurs (accès, rectification, suppression — RGPD).
        </p>
        <p>
          Claude peut générer un gabarit à faire valider par un professionnel
          du droit.
        </p>
      </div>
    </div>
  );
}
