"use client";

import { useActionState } from "react";
import { reinitialiserMotDePasseAction } from "@/lib/actions/auth";
import MessageFormulaire from "./MessageFormulaire";
import BoutonEnvoi from "./BoutonEnvoi";

export default function FormulaireReinitialisation() {
  const [etat, action, enCours] = useActionState(
    reinitialiserMotDePasseAction,
    null,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="motDePasse" className="libelle mb-2">
          Nouveau mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          className="champ focus:champ-focus"
        />
      </div>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi enCours={enCours} texte="Enregistrer mon nouveau mot de passe" />
    </form>
  );
}
