// Constantes partagées du site

export const CERTIFICATIONS = [
  { id: "BIO", label: "Agriculture Biologique", emoji: "🌿" },
  { id: "LABEL_ROUGE", label: "Label Rouge", emoji: "🔴" },
  { id: "AOC", label: "AOC", emoji: "🏅" },
  { id: "AOP", label: "AOP", emoji: "🥇" },
  { id: "IGP", label: "IGP", emoji: "🗺️" },
  { id: "DEMETER", label: "Demeter (biodynamie)", emoji: "🌙" },
  { id: "HVE", label: "Haute Valeur Environnementale", emoji: "🐝" },
] as const;

export const CATEGORIES: Record<string, { label: string; emoji: string }> = {
  LEGUMES: { label: "Légumes", emoji: "🥕" },
  FRUITS: { label: "Fruits", emoji: "🍎" },
  VIANDE: { label: "Viande", emoji: "🥩" },
  VOLAILLE: { label: "Volaille", emoji: "🐔" },
  POISSON: { label: "Poisson", emoji: "🐟" },
  FRUITS_DE_MER: { label: "Fruits de mer", emoji: "🦐" },
  FROMAGE: { label: "Fromage", emoji: "🧀" },
  PRODUITS_LAITIERS: { label: "Produits laitiers", emoji: "🥛" },
  OEUFS: { label: "Œufs", emoji: "🥚" },
  VIN: { label: "Vin", emoji: "🍷" },
  BIERE: { label: "Bière", emoji: "🍺" },
  BOISSONS: { label: "Boissons", emoji: "🧃" },
  MIEL: { label: "Miel", emoji: "🍯" },
  EPICERIE: { label: "Épicerie", emoji: "🫙" },
  FARINE: { label: "Farine & céréales", emoji: "🌾" },
  HUILE: { label: "Huile", emoji: "🫒" },
  HERBES_AROMATES: { label: "Herbes & aromates", emoji: "🌿" },
  FLEURS: { label: "Fleurs", emoji: "💐" },
  AUTRE: { label: "Autre", emoji: "📦" },
};

// Statuts d'une commande (affichage)
export const STATUTS_COMMANDE: Record<string, { label: string; classe: string }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", classe: "bg-ocre/30 text-encre" },
  PAID: { label: "Payée", classe: "bg-verdigris text-platre" },
  CANCELLED: { label: "Annulée", classe: "bg-platre-fonce text-encre-doux" },
  REFUNDED: { label: "Remboursée", classe: "bg-outremer text-platre" },
  DISPUTED: { label: "Litige", classe: "bg-garance text-platre" },
};

export const UNITES: Record<string, string> = {
  KG: "kg",
  GRAMMES: "g",
  PIECE: "pièce",
  LITRE: "L",
  BOUTEILLE: "bouteille",
  BOTTE: "botte",
  SAC: "sac",
  CAISSE: "caisse",
  DOUZAINE: "douzaine",
};

// Taux de TVA proposés dans le formulaire d'annonce.
// `valeur` = centièmes de point (550 = 5,5 %), stocké dans Listing.tvaCents.
export const TAUX_TVA_OPTIONS = [
  { valeur: 0, libelle: "0 % (exonéré)" },
  { valeur: 550, libelle: "5,5 %" },
  { valeur: 1000, libelle: "10 %" },
  { valeur: 2000, libelle: "20 %" },
] as const;

// Encre peinte associée à chaque catégorie (étiquettes, marqueurs, plaques).
// `texte` garantit un contraste lisible sur `fond`.
export const COULEURS_CATEGORIES: Record<
  string,
  { fond: string; texte: string }
> = {
  LEGUMES: { fond: "#2f6b4f", texte: "#f1eada" },
  FRUITS: { fond: "#b93a1d", texte: "#f1eada" },
  VIANDE: { fond: "#7a3b54", texte: "#f1eada" },
  VOLAILLE: { fond: "#7a5230", texte: "#f1eada" },
  POISSON: { fond: "#1e3f8c", texte: "#f1eada" },
  FRUITS_DE_MER: { fond: "#152c66", texte: "#f1eada" },
  FROMAGE: { fond: "#dda92c", texte: "#28221b" },
  PRODUITS_LAITIERS: { fond: "#e9e0c9", texte: "#28221b" },
  OEUFS: { fond: "#dda92c", texte: "#28221b" },
  VIN: { fond: "#7a3b54", texte: "#f1eada" },
  BIERE: { fond: "#7a5230", texte: "#f1eada" },
  BOISSONS: { fond: "#1e3f8c", texte: "#f1eada" },
  MIEL: { fond: "#dda92c", texte: "#28221b" },
  EPICERIE: { fond: "#28221b", texte: "#f1eada" },
  FARINE: { fond: "#e3d7bc", texte: "#28221b" },
  HUILE: { fond: "#2f6b4f", texte: "#f1eada" },
  HERBES_AROMATES: { fond: "#2f6b4f", texte: "#f1eada" },
  FLEURS: { fond: "#b93a1d", texte: "#f1eada" },
  AUTRE: { fond: "#6b5f4e", texte: "#f1eada" },
};

// Formate un prix en centimes vers une chaîne "12,50 €"
export function formaterPrix(centimes: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(centimes / 100);
}
