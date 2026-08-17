"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifierCommandeExpediee, notifierCommandeLivree } from "@/lib/emails/notifications";
import type { EtatFormulaire } from "@/lib/actions/auth";

// ---------- Validation ----------

const schemaExpedition = z.object({
  orderId: z.string().min(1),
  carrier: z.string().min(1, "Indiquez le transporteur.").max(100),
  trackingNumber: z.string().min(1, "Indiquez le numéro de suivi.").max(200),
  trackingUrl: z
    .string()
    .max(500)
    .refine(
      (val) => val === "" || z.string().url().safeParse(val).success,
      "Le lien de suivi doit être une URL valide.",
    ),
});

const schemaOrderId = z.object({
  orderId: z.string().min(1),
});

// ---------- Helpers ----------

async function verifierProducteurConcerne(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          listing: { select: { producerId: true } },
        },
      },
    },
  });

  if (!order) return null;

  const estConcerne = order.items.some(
    (item) => item.listing.producerId === userId,
  );

  return estConcerne ? order : null;
}

// ---------- Expédier une commande ----------

export async function expedierCommandeAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  try {
    const user = await requireUser();
    if (user.role !== "PRODUCTEUR") {
      return { erreur: "Seuls les producteurs peuvent expédier une commande." };
    }

    const brut = {
      orderId: formData.get("orderId"),
      carrier: formData.get("carrier"),
      trackingNumber: formData.get("trackingNumber"),
      trackingUrl: formData.get("trackingUrl"),
    };

    const validation = schemaExpedition.safeParse(brut);
    if (!validation.success) {
      return { erreur: validation.error.issues[0].message };
    }

    const { orderId, carrier, trackingNumber, trackingUrl } = validation.data;

    const order = await verifierProducteurConcerne(orderId, user.id);
    if (!order) {
      return { erreur: "Cette commande n'existe pas ou ne vous concerne pas." };
    }

    if (order.status !== "PAID" || order.deliveryStatus !== "NOT_SHIPPED") {
      return { erreur: "Cette commande ne peut pas être expédiée." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryStatus: "SHIPPED",
        shippingCarrier: carrier,
        shippingTrackingNumber: trackingNumber,
        shippingTrackingUrl: trackingUrl || null,
        shippedAt: new Date(),
      },
    });

    // Notifier l'acheteur (envoi synchrone pour Vercel)
    await notifierCommandeExpediee(orderId);

    revalidatePath(`/tableau-de-bord/commandes/${orderId}`);
    revalidatePath("/tableau-de-bord/commandes");

    return { succes: "La commande a bien été marquée comme expédiée." };
  } catch (err) {
    console.error("[livraison] erreur expedierCommandeAction:", err);
    return { erreur: "Une erreur est survenue. Réessayez dans un instant." };
  }
}

// ---------- Marquer comme livrée ----------

export async function marquerLivreeCommandeAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  try {
    const user = await requireUser();
    if (user.role !== "PRODUCTEUR") {
      return { erreur: "Seuls les producteurs peuvent marquer une commande comme livrée." };
    }

    const orderId = String(formData.get("orderId") ?? "");
    if (!orderId) {
      return { erreur: "Identifiant de commande manquant." };
    }

    const order = await verifierProducteurConcerne(orderId, user.id);
    if (!order) {
      return { erreur: "Cette commande n'existe pas ou ne vous concerne pas." };
    }

    if (order.deliveryStatus !== "SHIPPED") {
      return { erreur: "La commande doit d'abord être expédiée." };
    }

    if (order.status !== "PAID") {
      return { erreur: "Cette commande ne peut pas être marquée comme livrée." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryStatus: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    // Notifier l'acheteur (envoi synchrone pour Vercel)
    await notifierCommandeLivree(orderId);

    revalidatePath(`/tableau-de-bord/commandes/${orderId}`);
    revalidatePath("/tableau-de-bord/commandes");

    return { succes: "La commande a bien été marquée comme livrée." };
  } catch (err) {
    console.error("[livraison] erreur marquerLivreeCommandeAction:", err);
    return { erreur: "Une erreur est survenue. Réessayez dans un instant." };
  }
}
