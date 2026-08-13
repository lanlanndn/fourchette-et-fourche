// Numérotation des factures
import { PREFIXES_FACTURES } from "./constantes";
import type { TypeFacture } from "./types";

/** Formate un numéro de facture : FA-2026-00001. */
export function formaterNumero(
  type: TypeFacture,
  annee: number,
  sequence: number,
): string {
  return `${PREFIXES_FACTURES[type]}-${annee}-${String(sequence).padStart(5, "0")}`;
}
