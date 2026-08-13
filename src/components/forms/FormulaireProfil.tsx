"use client";

import { useActionState } from "react";
import type { User } from "@prisma/client";
import { updateProfilAction } from "@/lib/actions/profil";
import { CERTIFICATIONS } from "@/lib/constantes";
import MessageFormulaire from "@/components/forms/MessageFormulaire";
import BoutonEnvoi from "@/components/forms/BoutonEnvoi";

const classeChamp = "champ focus:champ-focus";
const classeLabel = "libelle mb-2";

export default function FormulaireProfil({ user }: { user: User }) {
  const [etat, action, enCours] = useActionState(updateProfilAction, null);
  const estProducteur = user.role === "PRODUCTEUR";

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="displayName" className={classeLabel}>
          {estProducteur
            ? "Nom de l'exploitation"
            : "Nom de l'établissement"}
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          defaultValue={user.displayName}
          className={classeChamp}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={classeLabel}>
            Téléphone{" "}
            <span className="font-medium normal-case tracking-normal text-encre-doux">
              (facultatif)
            </span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone ?? ""}
            placeholder="06 12 34 56 78"
            className={classeChamp}
          />
        </div>
        <div>
          <label htmlFor="siret" className={classeLabel}>
            SIRET{" "}
            <span className="font-medium normal-case tracking-normal text-encre-doux">
              (facultatif)
            </span>
          </label>
          <input
            id="siret"
            name="siret"
            type="text"
            inputMode="numeric"
            maxLength={14}
            defaultValue={user.siret ?? ""}
            placeholder="14 chiffres"
            className={classeChamp}
          />
        </div>
      </div>

      <div>
        <label htmlFor="tvaIntracom" className={classeLabel}>
          Numéro de TVA intracommunautaire{" "}
          <span className="font-medium normal-case tracking-normal text-encre-doux">
            (facultatif — apparaît sur vos factures)
          </span>
        </label>
        <input
          id="tvaIntracom"
          name="tvaIntracom"
          type="text"
          maxLength={13}
          defaultValue={user.tvaIntracom ?? ""}
          placeholder="FR12345678901"
          className={classeChamp}
        />
      </div>

      <div>
        <label htmlFor="adresse" className={classeLabel}>
          Adresse {estProducteur ? "de l'exploitation" : "du restaurant"}
        </label>
        <input
          id="adresse"
          name="adresse"
          type="text"
          defaultValue={user.address ?? ""}
          placeholder="Ex : 12 rue des Lilas, 44000 Nantes"
          className={classeChamp}
        />
        <p className="mt-1.5 text-xs text-encre-doux">
          Elle sert à vous placer sur la carte. Elle sera visible par les
          autres professionnels.
        </p>
      </div>

      <div>
        <label htmlFor="bio" className={classeLabel}>
          Présentation{" "}
          <span className="font-medium normal-case tracking-normal text-encre-doux">
            (facultatif)
          </span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={user.bio ?? ""}
          placeholder={
            estProducteur
              ? "Ex : Maraîcher bio depuis 15 ans, je cultive 40 variétés de légumes de saison…"
              : "Ex : Bistrot de quartier, cuisine de saison, je cherche des légumes et viandes locaux…"
          }
          className={classeChamp}
        />
      </div>

      {estProducteur && (
        <fieldset>
          <legend className={classeLabel}>Certifications</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {CERTIFICATIONS.map((cert) => (
              <label
                key={cert.id}
                className="flex cursor-pointer items-center gap-2 rounded-sm border-2 border-encre/25 bg-[#fbf7ec] px-3 py-2.5 text-sm font-medium transition-colors hover:border-verdigris has-checked:border-verdigris has-checked:bg-verdigris/10"
              >
                <input
                  type="checkbox"
                  name="certifications"
                  value={cert.id}
                  defaultChecked={user.certifications.includes(cert.id)}
                  className="accent-verdigris"
                />
                <span>{cert.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <MessageFormulaire etat={etat} />

      {/* Préférences emails */}
      <fieldset>
        <legend className={classeLabel}>Emails</legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-sm border-2 border-encre/25 bg-[#fbf7ec] px-3 py-2.5 text-sm transition-colors hover:border-outremer has-checked:border-outremer has-checked:bg-outremer/5">
          <input
            type="checkbox"
            name="emailNotifications"
            defaultChecked={user.emailNotifications !== false}
            className="accent-outremer mt-0.5"
          />
          <span className="leading-relaxed">
            M&rsquo;envoyer des emails quand je reçois un message, qu&rsquo;un
            paiement expire ou quand mes paiements sont activés. Les
            confirmations de commande sont toujours envoyées.
          </span>
        </label>
      </fieldset>

      <BoutonEnvoi enCours={enCours} texte="Enregistrer mon profil" />
    </form>
  );
}
