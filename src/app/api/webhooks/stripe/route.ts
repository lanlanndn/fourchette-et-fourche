import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { traiterCommandePayee } from "@/lib/commandes-utils";
import { notifierPaiementExpire, notifierOnboardingTermine } from "@/lib/emails/notifications";

/**
 * Webhook Stripe — point d'entrée unique pour tous les événements Stripe.
 * Stripe envoie des requêtes POST à cette URL. La signature est vérifiée
 * avec le secret de webhook (whsec_...).
 */
export async function POST(req: Request) {
  // Lire le corps brut AVANT toute vérification (obligatoire pour Stripe)
  const corps = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { erreur: "Signature manquante" },
      { status: 400 },
    );
  }

  // Vérifier la signature Stripe
  let evenement: Stripe.Event;
  try {
    evenement = await getStripe().webhooks.constructEventAsync(
      corps,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json(
      { erreur: "Signature invalide" },
      { status: 400 },
    );
  }

  // Mode démo : ne rien faire (pas de base de données)
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (evenement.type) {
      // --- Paiement réussi ---
      case "checkout.session.completed":
        await gererSessionCompletee(evenement.data.object as Stripe.Checkout.Session);
        break;

      // --- Session expirée (paiement abandonné) ---
      case "checkout.session.expired":
        await gererSessionExpiree(evenement.data.object as Stripe.Checkout.Session);
        break;

      // --- Onboarding producteur terminé ---
      case "account.updated":
        await gererCompteMisAJour(evenement.data.object as Stripe.Account);
        break;
    }
  } catch (err) {
    // Logguer l'erreur mais ne pas casser le webhook (Stripe réessaiera)
    console.error("Erreur webhook Stripe :", err);
  }

  return NextResponse.json({ received: true });
}

// ---------- Gestionnaires d'événements ----------

async function gererSessionCompletee(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) return;

  await traiterCommandePayee(orderId, paymentIntentId);
}

async function gererSessionExpiree(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const res = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "CANCELLED" },
  });

  // Notifier l'acheteur uniquement si la commande a bien été annulée
  if (res.count > 0) {
    notifierPaiementExpire(orderId);
  }
}

async function gererCompteMisAJour(account: Stripe.Account) {
  // Vérifier que l'onboarding est bien terminé
  if (account.charges_enabled && account.details_submitted) {
    // updateMany conditionnel : n'écrit que si le champ n'était pas déjà true
    // Évite de notifier à chaque account.updated ultérieur
    const res = await prisma.user.updateMany({
      where: { stripeAccountId: account.id, stripeOnboardingComplete: false },
      data: { stripeOnboardingComplete: true },
    });

    if (res.count > 0) {
      notifierOnboardingTermine(account.id);
    }
  }
}
