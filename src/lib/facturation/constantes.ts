// Constantes de la facturation (Factur-X)
import type { TypeFacture } from "./types";

/** Préfixes des numéros de facture (FA = acheteur, FV = vente, FC = commission). */
export const PREFIXES_FACTURES: Record<TypeFacture, string> = {
  ACHETEUR: "FA",
  VENTE: "FV",
  COMMISSION: "FC",
};

/** Libellés des types de facture (affichage PDF). */
export const LIBELLES_FACTURES: Record<TypeFacture, string> = {
  ACHETEUR: "FACTURE",
  VENTE: "FACTURE DE VENTE — AUTOFACTURATION",
  COMMISSION: "FACTURE DE COMMISSION",
};

/** Libellés courts pour les pages du site. */
export const LIBELLES_COURTS_FACTURES: Record<TypeFacture, string> = {
  ACHETEUR: "Facture d'achat",
  VENTE: "Facture de vente",
  COMMISSION: "Facture de commission",
};

/** Classes Tailwind des badges de type (pastille, monde « Enseigne peinte »). */
export const BADGES_TYPES_FACTURES: Record<TypeFacture, string> = {
  ACHETEUR: "bg-outremer text-platre",
  VENTE: "bg-verdigris text-platre",
  COMMISSION: "bg-ocre text-encre",
};

/** Taux de TVA appliqué à la commission (env, défaut 20 %). En centièmes de point. */
export const TAUX_TVA_COMMISSION_BP =
  (Number(process.env.PLATFORM_COMMISSION_TVA_PERCENT) || 20) * 100;

/** Taux de TVA sur les frais de port (transport) : 20 %. En centièmes de point. */
export const TAUX_TVA_PORT_BP = 2000;

/**
 * Unités du projet → codes UNECE Rec. 20 (attribut unitCode de BilledQuantity).
 * BOTTE n'existe pas dans Rec. 20 → C62 (pièce). BOUTEILLE → BO.
 */
export const CODES_UNITE_UNECE: Record<string, string> = {
  KG: "KGM",
  GRAMMES: "GRM",
  PIECE: "C62",
  LITRE: "LTR",
  BOUTEILLE: "BO",
  BOTTE: "C62",
  SAC: "XBG",
  CAISSE: "BX",
  DOUZAINE: "DZN",
};

/** Informations légales de la société qui émet les factures FA et FC. */
export function infosSociete() {
  return {
    nom: process.env.SOCIETE_NOM || "Fourchette & Fourche",
    siret: process.env.SOCIETE_SIRET || "",
    tvaIntracom: process.env.SOCIETE_TVA_INTRA || "",
    adresse: process.env.SOCIETE_ADRESSE || "",
    ville: process.env.SOCIETE_VILLE || "",
    codePostal: process.env.SOCIETE_CODE_POSTAL || "",
  };
}

/**
 * Ventile un montant TTC en HT + TVA (arrondi au centime).
 * Méthode unique pour les lignes ET les totaux → ΣHT + ΣTVA = ΣTTC par construction.
 * ht = round(ttc × 10000 / (10000 + tauxBp)) ; tva = ttc − ht.
 */
export function ventilerTva(
  ttcCents: number,
  tauxBp: number,
): { htCents: number; tvaCents: number } {
  if (tauxBp <= 0) return { htCents: ttcCents, tvaCents: 0 };
  const ht = Math.round((ttcCents * 10000) / (10000 + tauxBp));
  return { htCents: ht, tvaCents: ttcCents - ht };
}

/** Année de facturation (fuseau Europe/Paris, ex : 2026). */
export function anneeFacturation(date: Date): number {
  return Number(
    new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      year: "numeric",
    }).format(date),
  );
}
