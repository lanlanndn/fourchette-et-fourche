import { prisma } from "@/lib/prisma";
import { envoyerEmail } from "./envoi";
import {
  emailConfirmationAcheteur,
  emailNouvelleCommande,
  emailNouveauMessage,
  emailPaiementExpire,
  emailOnboardingTermine,
} from "./templates";

// ---------- Planificateur ----------

/**
 * Exécute une tâche d'envoi d'email en arrière-plan (fire-and-forget).
 * N'utilise pas after() car Vercel serverless ne le supporte pas toujours.
 */
function planifier(tache: () => Promise<void>): void {
  void tache().catch((err) => {
    console.error("[emails] erreur:", err);
  });
}

// ---------- Notifiers publics ----------

/** Envoie les emails de confirmation (acheteur + producteur). */
export function notifierCommandePayee(orderId: string): void {
  planifier(async () => {
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

    for (const item of order.items) {
      const { listing } = item;

      // Email à l'acheteur
      if (order.buyer.email) {
        await envoyerEmail({
          to: order.buyer.email,
          ...emailConfirmationAcheteur({
            displayName: order.buyer.displayName,
            titreProduit: listing.title,
            quantite: item.quantity,
            unite: listing.unit,
            prixUnitaireCents: item.unitPriceCents,
            totalCents: order.totalCents,
            orderId: order.id,
          }),
        });
      }

      // Email au producteur (transactionnel → toujours, ignore la préférence)
      if (listing.producer.email) {
        await envoyerEmail({
          to: listing.producer.email,
          ...emailNouvelleCommande({
            displayName: listing.producer.displayName,
            acheteurNom: order.buyer.displayName,
            titreProduit: listing.title,
            quantite: item.quantity,
            unite: listing.unit,
            totalCents: order.totalCents,
            commissionCents: order.commissionCents,
            orderId: order.id,
          }),
        });
      }
    }
  });
}

/** Envoie un email au destinataire d'un nouveau message. */
export function notifierNouveauMessage(params: {
  conversationId: string;
  senderId: string;
}): void {
  planifier(async () => {
    // Recharger la conversation pour avoir les participants
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

    // Notifier chaque participant sauf l'expéditeur
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
  });
}

/** Envoie un email à l'acheteur quand son paiement expire. */
export function notifierPaiementExpire(orderId: string): void {
  planifier(async () => {
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
  });
}

/** Envoie un email au producteur quand son onboarding Stripe est terminé. */
export function notifierOnboardingTermine(stripeAccountId: string): void {
  planifier(async () => {
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
  });
}
