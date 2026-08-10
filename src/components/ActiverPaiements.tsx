"use client";

import { useState } from "react";
import { activerPaiementsAction } from "@/lib/actions/paiement";

export default function ActiverPaiements({
  stripeAccountId,
  stripeOnboardingComplete,
}: {
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
}) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  const handleClick = async () => {
    setEnCours(true);
    setErreur("");
    try {
      const resultat = await activerPaiementsAction();
      if (resultat?.erreur) {
        setErreur(resultat.erreur);
      }
    } catch {
      setErreur("Une erreur est survenue. Réessaie dans quelques instants.");
    } finally {
      setEnCours(false);
    }
  };

  const dashboardUrl = stripeAccountId
    ? `https://dashboard.stripe.com/${stripeAccountId}`
    : "https://dashboard.stripe.com";

  return (
    <div>
      {stripeOnboardingComplete ? (
        <div>
          <span className="inline-block rounded-sm bg-verdigris px-3 py-1 text-xs font-bold tracking-wider text-platre uppercase">
            Paiements activés
          </span>
          <p className="mt-2 text-sm text-encre-doux">
            Vous recevez les paiements directement sur votre compte bancaire.
            Gérez vos transactions depuis votre{" "}
            <a
              href={dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-outremer underline underline-offset-2 transition-colors hover:text-outremer-nuit"
            >
              tableau de bord Stripe
            </a>
            .
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm leading-relaxed text-encre-doux">
            Recevez les paiements directement sur votre compte bancaire. Vous
            serez redirigé vers Stripe pour saisir vos informations (pièce
            d&apos;identité et RIB). Commission de la plateforme : 10 %.
          </p>
          <p className="mt-2 text-xs text-encre-doux/70">
            Mode test : utilisez les données de test fournies par Stripe (cliquez
            « Passer cette étape » sur chaque écran d&apos;onboarding).
          </p>

          {erreur && (
            <p className="mt-3 rounded-sm border-2 border-garance bg-garance/10 px-3 py-2 text-sm font-medium text-garance">
              {erreur}
            </p>
          )}

          <button
            type="button"
            onClick={handleClick}
            disabled={enCours}
            className="relief mt-4 rounded-sm border-2 border-encre bg-garance px-6 py-3 font-texte text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
          >
            {enCours ? "Redirection vers Stripe…" : "Activer les paiements"}
          </button>
        </div>
      )}
    </div>
  );
}
