import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { formaterPrix } from "@/lib/constantes";

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
  if (!orderId) return; // Événement rejoué sans notre metadata

  // Charger la commande avec ses items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { listing: { select: { id: true, title: true, producerId: true } } } },
    },
  });

  if (!order || order.status === "PAID") return; // Idempotence

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  // Transaction : passer la commande en PAID + décrémenter le stock
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        stripePaymentIntentId: paymentIntentId ?? null,
      },
    });

    // Décrémenter le stock pour chaque article
    for (const item of order.items) {
      await tx.listing.update({
        where: { id: item.listingId },
        data: {
          quantityAvailable: { decrement: item.quantity },
          quantitySold: { increment: item.quantity },
        },
      });

      // Créer une conversation automatique si elle n'existe pas déjà
      const existe = await tx.conversation.findFirst({
        where: {
          listingId: item.listingId,
          participants: { some: { userId: order.buyerId } },
        },
      });

      if (!existe) {
        await tx.conversation.create({
          data: {
            listingId: item.listingId,
            participants: {
              create: [
                { userId: order.buyerId },
                { userId: item.listing.producerId },
              ],
            },
            messages: {
              create: {
                senderId: order.buyerId,
                content: `Bonjour, je viens de régler ma commande pour « ${item.listing.title} » (${formaterPrix(order.totalCents)}).`,
              },
            },
          },
        });
      }
    }
  });
}

async function gererSessionExpiree(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "CANCELLED" },
  });
}

async function gererCompteMisAJour(account: Stripe.Account) {
  // Vérifier que l'onboarding est bien terminé
  if (account.charges_enabled && account.details_submitted) {
    await prisma.user.updateMany({
      where: { stripeAccountId: account.id },
      data: { stripeOnboardingComplete: true },
    });
  }
}
