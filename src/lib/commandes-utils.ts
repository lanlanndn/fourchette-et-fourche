import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { formaterPrix } from "@/lib/constantes";
import { notifierCommandePayee } from "@/lib/emails/notifications";
import { genererFacturesCommande } from "@/lib/facturation/generer";
import { genererBordereau } from "@/lib/expedition/generer";

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

    // Facturation Factur-X (3 factures + emails avec pièces jointes).
    // Ne doit JAMAIS casser le flux commande : la fonction ne lève pas
    // et ses erreurs sont journalisées avec le préfixe [facturation].
    try {
      const resultat = await genererFacturesCommande(orderId);
      if (!resultat.ok || resultat.erreurs.length > 0) {
        console.error("[facturation] commande", orderId, "— erreurs :", resultat.erreurs);
      }
    } catch (err) {
      console.error("[facturation] erreur inattendue pour la commande", orderId, ":", err);
    }

    // Bordereau d'envoi Mondial Relay — généré dès le paiement, prêt pour
    // le vendeur. Idempotent, ne casse jamais le flux (comme la facturation).
    try {
      const bordereau = await genererBordereau(orderId);
      if (!bordereau.ok) {
        console.error("[bordereau] commande", orderId, "— erreurs :", bordereau.erreurs);
      }
    } catch (err) {
      console.error("[bordereau] erreur inattendue pour la commande", orderId, ":", err);
    }
  }
}

/**
 * Enregistre l'adresse de livraison collectée par Stripe Checkout
 * (shipping_address_collection) sur la commande, pour le vendeur.
 * Idempotent : n'écrit que si l'adresse n'est pas encore renseignée
 * (le webhook et la page de retour peuvent arriver dans n'importe quel ordre).
 */
export async function enregistrerAdresseLivraison(
  orderId: string,
  session: Stripe.Checkout.Session,
): Promise<void> {
  // Stripe ≥ 2025 : l'adresse collectée par le Checkout est dans
  // collected_information.shipping_details, le téléphone sur session.phone.
  const details = session.collected_information?.shipping_details;
  if (!details?.address) return;

  try {
    await prisma.order.updateMany({
      where: { id: orderId, shippingAddressLigne1: null },
      data: {
        shippingAddressNom: details.name ?? undefined,
        shippingAddressLigne1: details.address.line1 ?? undefined,
        shippingAddressLigne2: details.address.line2 ?? null,
        shippingAddressCP: details.address.postal_code ?? undefined,
        shippingAddressVille: details.address.city ?? undefined,
        shippingAddressPays: details.address.country ?? "FR",
        shippingAddressTel: session.customer_details?.phone ?? undefined,
      },
    });
  } catch (err) {
    console.error("[livraison] adresse non enregistrée pour", orderId, ":", err);
  }
}
