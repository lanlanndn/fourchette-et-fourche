import { prisma } from "@/lib/prisma";
import { formaterPrix } from "@/lib/constantes";
import { notifierCommandePayee } from "@/lib/emails/notifications";

/**
 * Traite une commande après paiement réussi.
 * Idempotent : ne fait rien si la commande est déjà PAID.
 */
export async function traiterCommandePayee(
  orderId: string,
  paymentIntentId: string,
) {
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
              producerId: true,
              producer: {
                select: { id: true, email: true, displayName: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order || order.status === "PAID") return; // Idempotence

  let traitee = false;

  await prisma.$transaction(async (tx) => {
    // updateMany au lieu de update : protège contre la race condition
    // si le webhook et la page de retour arrivent en même temps
    const res = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING_PAYMENT" },
      data: {
        status: "PAID",
        stripePaymentIntentId: paymentIntentId,
      },
    });

    if (res.count === 0) return; // Un autre traitement est passé avant

    traitee = true;

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

  // Envoyer les emails APRES la transaction (dans after(), non bloquant)
  if (traitee) {
    await notifierCommandePayee(orderId);
  }
}
