"use client";

import { useState } from "react";
import { useActionState } from "react";
import { creerCommandeAction } from "@/lib/actions/commandes";
import { formaterPrix } from "@/lib/constantes";
import { calculerFraisPort, POIDS_MAX_GRAMMES } from "@/lib/expedition/tarifs";
import MessageFormulaire from "@/components/forms/MessageFormulaire";
import BoutonEnvoi from "@/components/forms/BoutonEnvoi";

type Props = {
  listingId: string;
  prixCents: number;
  unit: string;
  quantiteDisponible: number;
  poidsGrammes: number; // poids d'UNE unité (frais de port)
  estConnecte: boolean;
  estMonAnnonce: boolean;
  paiementsProducteurActifs: boolean;
};

export default function FormulaireCommande({
  listingId,
  prixCents,
  unit,
  quantiteDisponible,
  poidsGrammes,
  estConnecte,
  estMonAnnonce,
  paiementsProducteurActifs,
}: Props) {
  const [quantiteChoisie, setQuantiteChoisie] = useState(1);
  const [etat, actionAvecEtat, enCours] = useActionState(
    creerCommandeAction,
    null,
  );

  // Non connecté
  if (!estConnecte) {
    return (
      <a
        href="/connexion"
        className="relief block w-full rounded-sm border-2 border-encre bg-garance px-6 py-3.5 text-center font-texte text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce"
      >
        Connectez-vous pour commander
      </a>
    );
  }

  // Sa propre annonce
  if (estMonAnnonce) {
    return (
      <button
        type="button"
        disabled
        className="relief w-full rounded-sm border-2 border-encre bg-garance px-6 py-3.5 font-texte text-sm font-bold tracking-wide text-platre uppercase opacity-50 cursor-not-allowed"
        title="Vous ne pouvez pas commander votre propre annonce."
      >
        C&apos;est votre annonce
      </button>
    );
  }

  // Producteur pas encore activé
  if (!paiementsProducteurActifs) {
    return (
      <button
        type="button"
        disabled
        className="relief w-full rounded-sm border-2 border-encre bg-garance px-6 py-3.5 font-texte text-sm font-bold tracking-wide text-platre uppercase opacity-50 cursor-not-allowed"
        title="Ce producteur n'a pas encore activé les paiements en ligne."
      >
        Commander
      </button>
    );
  }

  const produitsCents = prixCents * quantiteChoisie;
  const fraisPortCents = calculerFraisPort(
    Math.round(poidsGrammes * quantiteChoisie),
  );
  const totalCents = fraisPortCents === null ? produitsCents : produitsCents + fraisPortCents;

  // Colis trop lourd : paiement impossible, il faut contacter le producteur
  if (fraisPortCents === null) {
    return (
      <div className="space-y-3">
        <p className="rounded-sm border-2 border-garance bg-garance/10 px-4 py-3 text-sm font-medium text-garance">
          Commande trop lourde pour la livraison (max {POIDS_MAX_GRAMMES / 1000} kg).
          Contactez le producteur via la messagerie.
        </p>
        <button
          type="button"
          disabled
          className="relief w-full rounded-sm border-2 border-encre bg-garance px-6 py-3.5 font-texte text-sm font-bold tracking-wide text-platre uppercase opacity-50 cursor-not-allowed"
        >
          Payer avec Stripe
        </button>
      </div>
    );
  }

  return (
    <form action={actionAvecEtat} className="space-y-3.5">
      <input type="hidden" name="listingId" value={listingId} />

      {/* Quantité */}
      <div className="flex items-center gap-3">
        <label htmlFor="quantite-cmd" className="libelle shrink-0 text-encre-doux">
          Quantité
        </label>
        <input
          id="quantite-cmd"
          name="quantite"
          type="number"
          min={1}
          max={quantiteDisponible}
          value={quantiteChoisie}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 1 && v <= quantiteDisponible) {
              setQuantiteChoisie(v);
            }
          }}
          className="champ focus:champ-focus w-24 text-center"
        />
        <span className="text-sm text-encre-doux">
          {unit.toLowerCase()}(s)
          {quantiteDisponible <= 10 && (
            <span className="ml-1 text-garance">
              ({quantiteDisponible} dispo.)
            </span>
          )}
        </span>
      </div>

      {/* Total produits + port */}
      <dl className="space-y-1 border-t-2 border-encre/10 pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-encre-doux">Produits</dt>
          <dd className="text-encre">{formaterPrix(produitsCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-encre-doux">Frais de port (Mondial Relay)</dt>
          <dd className="text-encre">{formaterPrix(fraisPortCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t-2 border-encre/10 pt-2">
          <dt className="font-bold text-encre">Total</dt>
          <dd className="prix-peint text-2xl text-garance">
            {formaterPrix(totalCents)}
          </dd>
        </div>
      </dl>

      <p className="text-xs text-encre-doux/70">
        Adresse de livraison demandée à l&apos;étape du paiement. Commission de
        10 % incluse, le reste est reversé directement au producteur.
      </p>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi
        texte="Payer avec Stripe"
        enCours={enCours}
      />
    </form>
  );
}
