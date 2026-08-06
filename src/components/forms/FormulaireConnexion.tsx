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

      <div>
        <label htmlFor="motDePasse" className="libelle mb-2">
          Mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          required
          autoComplete="current-password"
          className="champ focus:champ-focus"
        />
      </div>

      <div className="text-right">
        <a
          href="/mot-de-passe-oublie"
          className="text-xs font-medium text-encre-doux underline underline-offset-2 hover:text-garance"
        >
          Mot de passe oublié ?
        </a>
      </div>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi enCours={enCours} texte="Me connecter" />
    </form>
  );
}
