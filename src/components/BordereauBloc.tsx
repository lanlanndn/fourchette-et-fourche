"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { EtatFormulaire } from "@/lib/actions/auth";
import { formaterPoids } from "@/lib/expedition/tarifs";
import MessageFormulaire from "@/components/forms/MessageFormulaire";
import BoutonEnvoi from "@/components/forms/BoutonEnvoi";

type Props = {
  orderId: string;
  nomDestinataire: string;
  adresseLigne1: string;
  adresseLigne2?: string | null;
  codePostal: string;
  ville: string;
  poidsTotalGrammes: number;
  bordereauDisponible: boolean;
  serverAction: (_prev: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
};

/**
 * Bloc « Expédier la commande » côté producteur, façon Vinted :
 * adresse de livraison + bordereau PDF prêt à télécharger + dépôt du colis.
 */
export default function BordereauBloc({
  orderId,
  nomDestinataire,
  adresseLigne1,
  adresseLigne2,
  codePostal,
  ville,
  poidsTotalGrammes,
  bordereauDisponible,
  serverAction,
}: Props) {
  const [etat, actionAvecEtat, enCours] = useActionState(serverAction, null);

  return (
    <div className="space-y-4">
      <h2 className="font-affiche text-lg text-encre uppercase">
        Expédier la commande
      </h2>

      {/* Adresse de livraison de l'acheteur */}
      <div className="rounded-sm border-2 border-encre/15 bg-platre/60 p-4 text-sm">
        <p className="libelle text-encre-doux">Adresse de livraison</p>
        <p className="mt-1 font-bold text-encre">{nomDestinataire}</p>
        <p className="text-encre">
          {adresseLigne1}
          {adresseLigne2 ? ` — ${adresseLigne2}` : ""}
          <br />
          {codePostal} {ville}
        </p>
        <p className="mt-1.5 text-xs text-encre-doux">
          Poids du colis : {formaterPoids(poidsTotalGrammes)}
        </p>
      </div>

      {/* Bordereau généré automatiquement au paiement */}
      {bordereauDisponible ? (
        <Link
          href={`/api/bordereaux/${orderId}/telecharger`}
          className="relief block rounded-sm border-2 border-encre bg-outremer px-6 py-3 text-center font-texte text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-outremer-fonce"
        >
          Télécharger le bordereau (PDF)
        </Link>
      ) : (
        <p className="text-xs text-encre-doux italic">
          Bordereau en cours de génération… Rechargez la page dans un instant.
        </p>
      )}

      {/* Colis déposé — le suivi est rempli automatiquement */}
      <form action={actionAvecEtat} className="space-y-3">
        <input type="hidden" name="orderId" value={orderId} />
        <MessageFormulaire etat={etat} />
        <BoutonEnvoi
          enCours={enCours}
          texte="J'ai déposé le colis"
          texteEnCours="Confirmation…"
        />
        <p className="text-xs text-encre-doux">
          Imprimez le bordereau, collez-le sur le colis et déposez-le dans un
          point Mondial Relay. L&apos;acheteur reçoit le numéro de suivi
          automatiquement.
        </p>
      </form>
    </div>
  );
}
