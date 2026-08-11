import { prisma } from "@/lib/prisma";
import { formaterPrix } from "@/lib/constantes";

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
      items: {
        include: {
          listing: { select: { id: true, title: true, producerId: true } },
        },
      },
    },
  });

  if (!order || order.status === "PAID") return; // Idempotence

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        stripePaymentIntentId: paymentIntentId,
      },
    });

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
