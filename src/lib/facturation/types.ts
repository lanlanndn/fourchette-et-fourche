// Types partagés de la facturation Factur-X

export type TypeFacture = "ACHETEUR" | "VENTE" | "COMMISSION";

/** Une partie (vendeur ou acheteur) d'une facture. */
export interface PartieFacture {
  nom: string;
  siret?: string;
  tvaIntracom?: string;
  adresse: string; // rue — "—" si inconnue
  codePostal: string;
  ville: string;
  pays: string; // "FR"
}

/** Une ligne de facture, avec ventilation HT/TVA déjà calculée. */
export interface LigneFacture {
  nom: string;
  quantite: number;
  uniteCode: string; // code UNECE Rec. 20 (KGM, C62…)
  uniteLibelle: string; // libellé lisible ("kg", "pièce"…)
  prixUnitaireTtcCents: number;
  montantTtcCents: number;
  tauxTvaBp: number; // centièmes de point : 550 = 5,5 %
  montantHtCents: number;
  montantTvaCents: number;
}

/** Ventilation de TVA par taux (base HT + montant de TVA). */
export interface VentilationTva {
  tauxBp: number;
  baseHtCents: number;
  tvaCents: number;
}

/** Tout ce qu'il faut pour construire une facture (XML + PDF). */
export interface PayloadFacture {
  type: TypeFacture;
  numero: string;
  annee: number;
  dateEmission: Date;
  vendeur: PartieFacture;
  acheteur: PartieFacture;
  lignes: LigneFacture[];
  ventilation: VentilationTva[];
  totalHtCents: number;
  totalTvaCents: number;
  totalTtcCents: number;
  referenceCommande: string;
  referencePaiement?: string; // pi_… Stripe (facture acheteur uniquement)
  estPayee: boolean;
  mentionAutofacturation?: boolean; // FV uniquement
}
