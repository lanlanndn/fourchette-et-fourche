import Stripe from "stripe";

// Client Stripe côté serveur (clé secrète, ne JAMAIS exposer au client).
const STRIPE_API_VERSION = "2026-07-29.dahlia";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: STRIPE_API_VERSION,
  typescript: true,
});

// Commission de la plateforme (paramétrable via .env.local).
export const COMMISSION_PERCENT =
  Number(process.env.PLATFORM_COMMISSION_PERCENT) || 10;

/** Calcule le montant de la commission en centimes. */
export function calculerCommission(totalCents: number): number {
  return Math.round((totalCents * COMMISSION_PERCENT) / 100);
}
