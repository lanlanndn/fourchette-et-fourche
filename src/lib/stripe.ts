import Stripe from "stripe";

// Commission de la plateforme (paramétrable via .env.local).
export const COMMISSION_PERCENT =
  Number(process.env.PLATFORM_COMMISSION_PERCENT) || 10;

/** Calcule le montant de la commission en centimes. */
export function calculerCommission(totalCents: number): number {
  return Math.round((totalCents * COMMISSION_PERCENT) / 100);
}

// Client Stripe paresseux — créé seulement si la clé est configurée.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe n'est pas configuré (STRIPE_SECRET_KEY manquante).");
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-07-29.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}
