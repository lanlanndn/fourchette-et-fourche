import type { Metadata } from "next";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-brun">
        Politique de confidentialité
      </h1>
      <div className="mt-6 space-y-4 rounded-xl border border-terre-pale bg-terre-pale/30 p-6 text-sm text-brun">
        <p className="font-semibold">
          ⚠️ Gabarit temporaire — à compléter avant l&apos;ouverture des
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
