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
        <label htmlFor="motDePasse" className="mb-1.5 block text-sm font-semibold text-brun">
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
          className="w-full rounded-lg border border-creme-fonce bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-foret"
        />
      </div>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi enCours={enCours} texte="Enregistrer mon nouveau mot de passe" />
    </form>
  );
}
