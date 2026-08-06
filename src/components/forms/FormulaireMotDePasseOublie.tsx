"use client";

import { useActionState } from "react";
import { motDePasseOublieAction } from "@/lib/actions/auth";
import MessageFormulaire from "./MessageFormulaire";
import BoutonEnvoi from "./BoutonEnvoi";

export default function FormulaireMotDePasseOublie() {
  const [etat, action, enCours] = useActionState(motDePasseOublieAction, null);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="email" className="libelle mb-2">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@exemple.fr"
          className="champ focus:champ-focus"
        />
      </div>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi enCours={enCours} texte="Envoyer le lien de réinitialisation" />
    </form>
  );
}
