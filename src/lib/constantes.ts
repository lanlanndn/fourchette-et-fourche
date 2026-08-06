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

// Formate un prix en centimes vers une chaîne "12,50 €"
export function formaterPrix(centimes: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(centimes / 100);
}
