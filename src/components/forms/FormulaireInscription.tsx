"use client";

import { useActionState } from "react";
import { inscriptionAction } from "@/lib/actions/auth";
import MessageFormulaire from "./MessageFormulaire";
import BoutonEnvoi from "./BoutonEnvoi";

export default function FormulaireInscription() {
  const [etat, action, enCours] = useActionState(inscriptionAction, null);

  return (
    <form action={action} className="space-y-5">
      {/* Choix du rôle */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-brun">
          Tu es…
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value="RESTAURATEUR"
              className="peer sr-only"
              required
            />
            <div className="rounded-xl border-2 border-creme-fonce bg-white p-4 text-center transition-all peer-checked:border-terre peer-checked:bg-terre-pale/40">
              <p className="text-3xl">🍽️</p>
              <p className="mt-1 text-sm font-semibold text-brun">
                Restaurateur
              </p>
              <p className="mt-0.5 text-xs text-brun-clair">
                Je cherche des produits locaux
              </p>
            </div>
          </label>
          <label className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value="PRODUCTEUR"
              className="peer sr-only"
              required
            />
            <div className="rounded-xl border-2 border-creme-fonce bg-white p-4 text-center transition-all peer-checked:border-foret peer-checked:bg-foret-pale/40">
              <p className="text-3xl">🚜</p>
              <p className="mt-1 text-sm font-semibold text-brun">
                Producteur
              </p>
              <p className="mt-0.5 text-xs text-brun-clair">
                Je vends mes produits
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="nom" className="mb-1.5 block text-sm font-semibold text-brun">
          Nom de l&apos;établissement ou de l&apos;exploitation
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          placeholder="Ex : Bistrot du Marché / Ferme des Lilas"
          className="w-full rounded-lg border border-creme-fonce bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-foret"
        />
      </div>

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
          minLength={8}
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          className="w-full rounded-lg border border-creme-fonce bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-foret"
        />
      </div>

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi enCours={enCours} texte="Créer mon compte" />

      <p className="text-center text-xs text-brun-clair">
        En créant un compte, tu acceptes nos{" "}
        <a href="/cgv" className="underline hover:text-foret">
          CGV
        </a>{" "}
        et notre{" "}
        <a href="/politique-confidentialite" className="underline hover:text-foret">
          politique de confidentialité
        </a>
        .
      </p>
    </form>
  );
}
