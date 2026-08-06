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
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-brun">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="toi@exemple.fr"
          className="w-full rounded-lg border border-creme-fonce bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-foret"
        />
      </div>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi enCours={enCours} texte="Envoyer le lien de réinitialisation" />
    </form>
  );
}
