"use client";

import { useActionState } from "react";
import type { EtatFormulaire } from "@/lib/actions/auth";
import MessageFormulaire from "@/components/forms/MessageFormulaire";
import BoutonEnvoi from "@/components/forms/BoutonEnvoi";

const classeChamp = "champ focus:champ-focus";
const classeLabel = "libelle mb-2";

type Props = {
  orderId: string;
  serverAction: (_prev: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
};

export default function FormulaireExpedition({ orderId, serverAction }: Props) {
  const [etat, actionAvecEtat, enCours] = useActionState(serverAction, null);

  return (
    <form action={actionAvecEtat} className="space-y-5">
      <input type="hidden" name="orderId" value={orderId} />

      <h2 className="font-affiche text-lg text-encre uppercase">Expédier la commande</h2>

      <MessageFormulaire etat={etat} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="carrier" className={classeLabel}>
            Transporteur
          </label>
          <input
            id="carrier"
            name="carrier"
            type="text"
            required
            placeholder="Ex : Mondial Relay, Colissimo, Chronopost"
            className={classeChamp}
          />
        </div>

        <div>
          <label htmlFor="trackingNumber" className={classeLabel}>
            Numéro de suivi
          </label>
          <input
            id="trackingNumber"
            name="trackingNumber"
            type="text"
            required
            placeholder="Ex : 1234567890"
            className={classeChamp}
          />
        </div>
      </div>

      <div>
        <label htmlFor="trackingUrl" className={classeLabel}>
          Lien de suivi <span className="font-medium normal-case tracking-normal text-encre-doux">(optionnel)</span>
        </label>
        <input
          id="trackingUrl"
          name="trackingUrl"
          type="url"
          placeholder="https://..."
          className={classeChamp}
        />
      </div>

      <BoutonEnvoi
        enCours={enCours}
        texte="Confirmer l'expédition"
        texteEnCours="Confirmation…"
      />

      <p className="text-xs text-encre-doux">
        Un email de suivi sera envoyé automatiquement à l&apos;acheteur.
      </p>
    </form>
  );
}
