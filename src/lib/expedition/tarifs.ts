// Tarifs des frais de port — livraison à domicile Mondial Relay.
// Montants facturés à l'acheteur, en centimes, par tranche de poids.
// Fonction pure : importable côté client (aperçu avant paiement).

/** Poids maximal d'un colis Mondial Relay : 30 kg. */
export const POIDS_MAX_GRAMMES = 30_000;

/**
 * Grille par tranche de poids (grammes), France métropolitaine.
 * TODO(production) : ajuster ces montants avec le tarif officiel du compte
 * Mondial Relay (ils doivent couvrir le coût du bordereau + une marge).
 */
const GRILLE_PORT: ReadonlyArray<{ maxGrammes: number; centimes: number }> = [
  { maxGrammes: 500, centimes: 550 }, // 0,5 kg — 5,50 €
  { maxGrammes: 1000, centimes: 650 }, // 1 kg
  { maxGrammes: 2000, centimes: 750 }, // 2 kg
  { maxGrammes: 3000, centimes: 850 },
  { maxGrammes: 4000, centimes: 950 },
  { maxGrammes: 5000, centimes: 1050 },
  { maxGrammes: 7000, centimes: 1250 },
  { maxGrammes: 10000, centimes: 1450 },
  { maxGrammes: 15000, centimes: 1750 },
  { maxGrammes: 20000, centimes: 2450 },
  { maxGrammes: POIDS_MAX_GRAMMES, centimes: 3250 }, // 30 kg
];

/**
 * Calcule les frais de port en centimes pour un poids total en grammes.
 * Renvoie null si le poids est invalide ou dépasse 30 kg (colis refusé).
 */
export function calculerFraisPort(poidsGrammesTotal: number): number | null {
  if (!Number.isFinite(poidsGrammesTotal) || poidsGrammesTotal <= 0) {
    return null;
  }
  if (poidsGrammesTotal > POIDS_MAX_GRAMMES) {
    return null;
  }
  const tranche = GRILLE_PORT.find((t) => poidsGrammesTotal <= t.maxGrammes);
  return tranche?.centimes ?? null;
}

/** Libellé du poids pour l'affichage : 2500 → "2,5 kg", 1000 → "1 kg". */
export function formaterPoids(grammes: number): string {
  if (grammes < 1000) return `${grammes} g`;
  const kg = grammes / 1000;
  return `${kg.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kg`;
}
