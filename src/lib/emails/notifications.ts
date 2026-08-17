import { prisma } from "@/lib/prisma";
import { envoyerEmail } from "./envoi";
import { formaterPoids } from "@/lib/expedition/tarifs";
import {
  emailConfirmationAcheteur,
  emailNouvelleCommande,
  emailNouveauMessage,
  emailPaiementExpire,
  emailOnboardingTermine,
  emailCommandeExpediee,
  emailCommandeLivree,
} from "./templates";

// ---------- Notifiers publics (tous async, appelés avec await) ----------

/** Envoie les emails de confirmation (acheteur + producteur). */
export async function notifierCommandePayee(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { id: true, email: true, displayName: true } },
        items: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                unit: true,
                poidsGrammes: true,
                producer: {
                  select: { id: true, email: true, displayName: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order || order.status !== "PAID") return;

    // Adresse de livraison + poids du colis (pour l'email du producteur)
    const adresseLivraison = order.shippingAddressLigne1
      ? `${order.shippingAddressLigne1}${order.shippingAddressLigne2 ? ` — ${order.shippingAddressLigne2}` : ""}, ${order.shippingAddressCP} ${order.shippingAddressVille}`
      : null;
    const poidsTotal = order.items.reduce(
      (somme, item) => somme + Math.round(item.listing.poidsGrammes * item.quantity),
      0,
    );

    for (const item of order.items) {
      const { listing } = item;

      if (order.buyer.email) {
        await envoyerEmail({
          to: order.buyer.email,
          ...emailConfirmationAcheteur({
            displayName: order.buyer.displayName,
            titreProduit: listing.title,
            quantite: item.quantity,
            unite: listing.unit,
            prixUnitaireCents: item.unitPriceCents,
            shippingPriceCents: order.shippingPriceCents,
            totalCents: order.totalCents,
            orderId: order.id,
          }),
        });
      }

      if (listing.producer.email) {
        await envoyerEmail({
          to: listing.producer.email,
          ...emailNouvelleCommande({
            displayName: listing.producer.displayName,
            acheteurNom: order.buyer.displayName,
            titreProduit: listing.title,
            quantite: item.quantity,
            unite: listing.unit,
            shippingPriceCents: order.shippingPriceCents,
            totalCents: order.totalCents,
            commissionCents: order.commissionCents,
            adresseLivraison,
            poidsLibelle: formaterPoids(poidsTotal),
            orderId: order.id,
          }),
        });
      }
    }
  } catch (err) {
    console.error("[emails] erreur notifierCommandePayee:", err);
  }
}

/** Envoie un email au destinataire d'un nouveau message. */
export async function notifierNouveauMessage(params: {
  conversationId: string;
  senderId: string;
}): Promise<void> {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.conversationId },
      include: {
        listing: { select: { title: true } },
        participants: {
          include: {
            user: {
              select: { id: true, email: true, displayName: true, emailNotifications: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, senderId: true },
        },
      },
    });

    if (!conversation) return;

    const dernierMessage = conversation.messages[0];
    if (!dernierMessage) return;

    const expediteur = conversation.participants.find(
      (p) => p.userId === params.senderId,
    );

    for (const participant of conversation.participants) {
      if (participant.userId === params.senderId) continue;
      if (participant.user.emailNotifications === false) continue;
      if (!participant.user.email) continue;

      await envoyerEmail({
        to: participant.user.email,
        ...emailNouveauMessage({
          displayName: participant.user.displayName,
          expediteurNom: expediteur?.user.displayName ?? "Quelqu'un",
          titreProduit: conversation.listing.title,
          contenuMessage: dernierMessage.content,
          conversationId: conversation.id,
        }),
      });
    }
  } catch (err) {
    console.error("[emails] erreur notifierNouveauMessage:", err);
  }
}

/** Envoie un email à l'acheteur quand son paiement expire. */
export async function notifierPaiementExpire(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { id: true, email: true, displayName: true, emailNotifications: true } },
        items: {
          take: 1,
          include: { listing: { select: { title: true } } },
        },
      },
    });

    if (!order) return;
    if (order.buyer.emailNotifications === false) return;
    if (!order.buyer.email) return;

    const titreProduit = order.items[0]?.listing.title ?? "votre commande";

    await envoyerEmail({
      to: order.buyer.email,
      ...emailPaiementExpire({
        displayName: order.buyer.displayName,
        titreProduit,
      }),
    });
  } catch (err) {
    console.error("[emails] erreur notifierPaiementExpire:", err);
  }
}

/** Envoie un email au producteur quand son onboarding Stripe est terminé. */
export async function notifierOnboardingTermine(stripeAccountId: string): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { stripeAccountId },
      select: { email: true, displayName: true, emailNotifications: true },
    });

    if (!user) return;
    if (user.emailNotifications === false) return;
    if (!user.email) return;

    await envoyerEmail({
      to: user.email,
      ...emailOnboardingTermine({ displayName: user.displayName }),
    });
  } catch (err) {
    console.error("[emails] erreur notifierOnboardingTermine:", err);
  }
}

/** Envoie un email à l'acheteur quand sa commande est expédiée. */
export async function notifierCommandeExpediee(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { email: true, displayName: true } },
        items: {
          take: 1,
          include: { listing: { select: { title: true } } },
        },
      },
    });

    if (!order) return;
    if (!order.buyer.email) return;

    const item = order.items[0];
    if (!item) return;

    await envoyerEmail({
      to: order.buyer.email,
      ...emailCommandeExpediee({
        displayName: order.buyer.displayName,
        titreProduit: item.listing.title,
        orderId: order.id,
        carrier: order.shippingCarrier ?? "Transporteur",
        trackingNumber: order.shippingTrackingNumber ?? "—",
        trackingUrl: order.shippingTrackingUrl ?? undefined,
      }),
    });
  } catch (err) {
    console.error("[emails] erreur notifierCommandeExpediee:", err);
  }
}

/** Envoie un email à l'acheteur quand sa commande est livrée. */
export async function notifierCommandeLivree(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { email: true, displayName: true } },
        items: {
          take: 1,
          include: { listing: { select: { title: true } } },
        },
      },
    });

    if (!order) return;
    if (!order.buyer.email) return;

    const item = order.items[0];
    if (!item) return;

    await envoyerEmail({
      to: order.buyer.email,
      ...emailCommandeLivree({
        displayName: order.buyer.displayName,
        titreProduit: item.listing.title,
        orderId: order.id,
        carrier: order.shippingCarrier ?? "Transporteur",
        trackingNumber: order.shippingTrackingNumber ?? "—",
        trackingUrl: order.shippingTrackingUrl ?? undefined,
      }),
    });
  } catch (err) {
    console.error("[emails] erreur notifierCommandeLivree:", err);
  }
}
