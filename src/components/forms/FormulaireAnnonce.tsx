"use client";

import { useActionState } from "react";
import type { Listing } from "@prisma/client";
import type { EtatFormulaire } from "@/lib/actions/auth";
import { CATEGORIES, UNITES, CERTIFICATIONS, TAUX_TVA_OPTIONS } from "@/lib/constantes";
import MessageFormulaire from "@/components/forms/MessageFormulaire";
import BoutonEnvoi from "@/components/forms/BoutonEnvoi";
import UploadPhotos from "@/components/forms/UploadPhotos";

const classeChamp = "champ focus:champ-focus";
const classeLabel = "libelle mb-2";

type Props = {
  action: (_prev: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  listing?: Listing | null; // null = création
  adresseProducteur?: string;
};

/** Formate des centimes en euros pour affichage (350 → "3,50"). */
function centimesVersEuros(centimes: number): string {
  return (centimes / 100).toFixed(2).replace(".", ",");
}

export default function FormulaireAnnonce({ action, listing, adresseProducteur }: Props) {
  const [etat, actionAvecEtat, enCours] = useActionState(action, null);
  const estCreation = !listing;

  return (
    <form action={actionAvecEtat} className="space-y-5">
      {!estCreation && (
        <input type="hidden" name="listingId" value={listing!.id} />
      )}

      {/* Titre */}
      <div>
        <label htmlFor="title" className={classeLabel}>
          Titre de l&apos;annonce
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={listing?.title ?? ""}
          placeholder="Ex : Tomates anciennes, Côtes de bœuf Aubrac…"
          className={classeChamp}
        />
      </div>

      {/* Ligne : Catégorie + Unité */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className={classeLabel}>
            Catégorie
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={listing?.category ?? ""}
            className={classeChamp}
          >
            <option value="" disabled>
              Choisis une catégorie…
            </option>
            {Object.entries(CATEGORIES).map(([id, cat]) => (
              <option key={id} value={id}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="unit" className={classeLabel}>
            Unité de vente
          </label>
          <select
            id="unit"
            name="unit"
            required
            defaultValue={listing?.unit ?? ""}
            className={classeChamp}
          >
            <option value="" disabled>
              Choisis une unité…
            </option>
            {Object.entries(UNITES).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ligne : Prix + Quantité + TVA */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="prixEuros" className={classeLabel}>
            Prix TTC <span className="font-medium normal-case tracking-normal text-encre-doux">(€)</span>
          </label>
          <input
            id="prixEuros"
            name="prixEuros"
            type="text"
            inputMode="decimal"
            required
            defaultValue={listing ? centimesVersEuros(listing.priceCents) : ""}
            placeholder="Ex : 3,50"
            className={classeChamp}
          />
        </div>
        <div>
          <label htmlFor="quantityAvailable" className={classeLabel}>
            Quantité disponible
          </label>
          <input
            id="quantityAvailable"
            name="quantityAvailable"
            type="number"
            min={1}
            required
            defaultValue={listing?.quantityAvailable ?? ""}
            className={classeChamp}
          />
        </div>
        <div>
          <label htmlFor="tvaCents" className={classeLabel}>
            Taux de TVA
          </label>
          <select
            id="tvaCents"
            name="tvaCents"
            defaultValue={listing ? String(listing.tvaCents ?? 550) : "550"}
            className={classeChamp}
          >
            {TAUX_TVA_OPTIONS.map((taux) => (
              <option key={taux.valeur} value={taux.valeur}>
                {taux.libelle}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={classeLabel}>
          Description{" "}
          <span className="font-medium normal-case tracking-normal text-encre-doux">
            (facultatif)
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={listing?.description ?? ""}
          placeholder="Décris ton produit : origine, méthode de production, conservation, suggestions d'utilisation…"
          className={classeChamp}
        />
      </div>

      {/* Certifications */}
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
                defaultChecked={listing?.certifications?.includes(cert.id)}
                className="accent-verdigris"
              />
              <span>{cert.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Adresse personnalisée */}
      <div>
        <label htmlFor="adresse" className={classeLabel}>
          Lieu de retrait{" "}
          <span className="font-medium normal-case tracking-normal text-encre-doux">
            (facultatif — ton adresse de profil par défaut)
          </span>
        </label>
        <input
          id="adresse"
          name="adresse"
          type="text"
          defaultValue={listing?.address ?? ""}
          placeholder={adresseProducteur ?? "Ex : 12 rue des Lilas, 44000 Nantes"}
          className={classeChamp}
        />
        <p className="mt-1.5 text-xs text-encre-doux">
          Laisse vide pour utiliser l&apos;adresse de ton profil. Renseigne une
          adresse uniquement si le retrait se fait ailleurs.
        </p>
      </div>

      {/* Upload photos */}
      <UploadPhotos
        photosExistantes={listing?.photos ?? []}
      />

      <MessageFormulaire etat={etat} />

      <BoutonEnvoi
        enCours={enCours}
        texte={estCreation ? "Publier l'annonce" : "Enregistrer les modifications"}
      />
    </form>
  );
}
