"use client";

import { useActionState } from "react";
import type { EtatFormulaire } from "@/lib/actions/auth";
import MessageFormulaire from "@/components/forms/MessageFormulaire";
import BoutonEnvoi from "@/components/forms/BoutonEnvoi";

type Props = {
  orderId: string;
  action: (_prev: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
};

export default function FormulaireLivree({ orderId, action }: Props) {
  const [etat, actionAvecEtat, enCours] = useActionState(action, null);

  return (
    <form action={actionAvecEtat} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <MessageFormulaire etat={etat} />
      <BoutonEnvoi
        enCours={enCours}
        texte="Marquer la commande comme livrée"
        texteEnCours="Mise à jour…"
      />
    </form>
  );
}
