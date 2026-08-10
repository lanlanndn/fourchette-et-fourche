"use client";

import { useState } from "react";
import { useActionState } from "react";
import { creerCommandeAction } from "@/lib/actions/commandes";
import { formaterPrix } from "@/lib/constantes";
import MessageFormulaire from "@/components/forms/MessageFormulaire";
import BoutonEnvoi from "@/components/forms/BoutonEnvoi";

type Props = {
  listingId: string;
  prixCents: number;
  unit: string;
  quantiteDisponible: number;
  estConnecte: boolean;
  estMonAnnonce: boolean;
  paiementsProducteurActifs: boolean;
};

export default function FormulaireCommande({
  listingId,
  prixCents,
  unit,
  quantiteDisponible,
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

  const totalCents = prixCents * quantiteChoisie;

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

      {/* Total */}
      <p className="text-sm text-encre">
        Total :{" "}
        <span className="prix-peint text-2xl text-garance">
          {formaterPrix(totalCents)}
        </span>
      </p>

      <p className="text-xs text-encre-doux/70">
        Commission de 10 % incluse. Le reste est reversé directement au
        producteur.
      </p>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi
        texte="Payer avec Stripe"
        enCours={enCours}
      />
    </form>
  );
}
