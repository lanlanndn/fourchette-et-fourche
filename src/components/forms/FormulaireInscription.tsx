"use client";

import { useActionState } from "react";
import { inscriptionAction } from "@/lib/actions/auth";
import MessageFormulaire from "./MessageFormulaire";
import BoutonEnvoi from "./BoutonEnvoi";
import { IconeFourche, IconeFourchette } from "@/components/icones";

export default function FormulaireInscription() {
  const [etat, action, enCours] = useActionState(inscriptionAction, null);

  return (
    <form action={action} className="space-y-5">
      {/* Choix du rôle */}
      <fieldset>
        <legend className="libelle mb-2">Vous êtes…</legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value="PRODUCTEUR"
              className="peer sr-only"
              required
            />
            <div className="rounded-sm border-2 border-encre/25 bg-[#fbf7ec] p-4 text-center transition-all peer-checked:border-garance peer-checked:bg-garance/10 peer-checked:shadow-[3px_3px_0_0_rgb(185_58_29/0.4)]">
              <p className="mx-auto flex h-10 w-10 items-center justify-center rounded-sm border-2 border-encre bg-ocre/25 text-encre">
                <IconeFourche className="h-6 w-6" />
              </p>
              <p className="mt-2 text-sm font-bold text-encre">Producteur</p>
              <p className="mt-0.5 text-xs text-encre-doux">
                Je vends mes produits
              </p>
            </div>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value="RESTAURATEUR"
              className="peer sr-only"
              required
            />
            <div className="rounded-sm border-2 border-encre/25 bg-[#fbf7ec] p-4 text-center transition-all peer-checked:border-outremer peer-checked:bg-outremer/10 peer-checked:shadow-[3px_3px_0_0_rgb(30_63_140/0.4)]">
              <p className="mx-auto flex h-10 w-10 items-center justify-center rounded-sm border-2 border-encre bg-ocre/25 text-encre">
                <IconeFourchette className="h-6 w-6" />
              </p>
              <p className="mt-2 text-sm font-bold text-encre">Restaurateur</p>
              <p className="mt-0.5 text-xs text-encre-doux">
                Je cherche des produits locaux
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="nom" className="libelle mb-2">
          Nom de l&apos;établissement ou de l&apos;exploitation
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          placeholder="Ex : Bistrot du Marché / Ferme des Lilas"
          className="champ focus:champ-focus"
        />
      </div>

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
          minLength={8}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          className="champ focus:champ-focus"
        />
      </div>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi enCours={enCours} texte="Créer mon compte" />

      <p className="text-center text-xs text-encre-doux">
        En créant un compte, vous acceptez nos{" "}
        <a href="/cgv" className="font-semibold underline hover:text-garance">
          CGV
        </a>{" "}
        et notre{" "}
        <a
          href="/politique-confidentialite"
          className="font-semibold underline hover:text-garance"
        >
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  );
}
