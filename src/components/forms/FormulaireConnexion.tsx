"use client";

import { useActionState } from "react";
import { connexionAction } from "@/lib/actions/auth";
import MessageFormulaire from "./MessageFormulaire";
import BoutonEnvoi from "./BoutonEnvoi";

export default function FormulaireConnexion() {
  const [etat, action, enCours] = useActionState(connexionAction, null);

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

      <div>
        <label htmlFor="motDePasse" className="mb-1.5 block text-sm font-semibold text-brun">
          Mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-creme-fonce bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-foret"
        />
      </div>

      <div className="text-right">
        <a
          href="/mot-de-passe-oublie"
          className="text-xs text-brun-clair underline hover:text-foret"
        >
          Mot de passe oublié ?
        </a>
      </div>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi enCours={enCours} texte="Me connecter" />
    </form>
  );
}
