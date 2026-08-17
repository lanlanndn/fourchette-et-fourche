"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, calculerCommission } from "@/lib/stripe";
import { calculerFraisPort, POIDS_MAX_GRAMMES } from "@/lib/expedition/tarifs";
import type { EtatFormulaire } from "@/lib/actions/auth";
import type { OrderStatus } from "@prisma/client";

// ---------- Compteur de commandes pour le badge ----------

/** Compte les commandes PAID pour le producteur connecté. */
export async function countNouvellesCommandes(): Promise<number> {
  try {
    const user = await requireUser();
    if (user.role !== "PRODUCTEUR") return 0;

    return prisma.order.count({
      where: {
        status: "PAID",
        items: { some: { listing: { producerId: user.id } } },
      },
    });
  } catch {
    return 0;
  }
}

// ---------- Validation ----------

const schemaCommande = z.object({
  listingId: z.string().min(1),
  quantite: z.coerce
    .number()
    .positive("La quantité doit être positive.")
    .max(999, "Quantité trop élevée."),
});

// ---------- Création de commande + session Stripe ----------

export async function creerCommandeAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  try {
    const user = await requireUser();
    if (user.role !== "RESTAURATEUR") {
      return { erreur: "Seuls les restaurateurs peuvent passer commande." };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return { erreur: "Le paiement en ligne n'est pas encore disponible." };
    }

    const stripe = getStripe();

    // Validation
    const brut = {
      listingId: formData.get("listingId"),
      quantite: formData.get("quantite"),
    };

    const validation = schemaCommande.safeParse(brut);
    if (!validation.success) {
      return { erreur: validation.error.issues[0].message };
    }
    const { listingId, quantite } = validation.data;

    // Charger l'annonce avec le producteur
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { producer: true },
    });

    if (!listing || !listing.isActive) {
      return { erreur: "Cette annonce n'est plus disponible." };
    }

    if (listing.producerId === user.id) {
      return { erreur: "Vous ne pouvez pas commander votre propre annonce." };
    }

    if (
      !listing.producer.stripeOnboardingComplete ||
      !listing.producer.stripeAccountId
    ) {
      return {
        erreur:
          "Ce producteur n'a pas encore activé ses paiements en ligne. Vous pouvez le contacter via la messagerie.",
      };
    }

    if (quantite > listing.quantityAvailable) {
      return {
        erreur: `Stock insuffisant. ${listing.quantityAvailable} disponible${listing.quantityAvailable > 1 ? "s" : ""}.`,
      };
    }

    // Calculer les montants : produits + frais de port (selon le poids)
    const produitsCents = listing.priceCents * quantite;
    const commissionCents = calculerCommission(produitsCents);

    const poidsTotalGrammes = Math.round(listing.poidsGrammes * quantite);
    const fraisPortCents = calculerFraisPort(poidsTotalGrammes);
    if (fraisPortCents === null) {
      return {
        erreur: `Commande trop lourde pour la livraison (max ${POIDS_MAX_GRAMMES / 1000} kg). Contactez le producteur via la messagerie.`,
      };
    }

    // Le port remonte à la plateforme via l'application fee Stripe :
    // c'est elle qui paie le bordereau Mondial Relay.
    const totalCents = produitsCents + fraisPortCents;

    // Créer la commande en base
    const order = await prisma.order.create({
      data: {
        buyerId: user.id,
        status: "PENDING_PAYMENT" as OrderStatus,
        totalCents,
        commissionCents,
        shippingMethod: "DOMICILE",
        shippingPriceCents: fraisPortCents,
        items: {
          create: [
            {
              listingId,
              quantity: quantite,
              unitPriceCents: listing.priceCents,
              subtotalCents: produitsCents,
            },
          ],
        },
      },
    });

    // Origine pour les URLs de retour
    const head = await headers();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ??
      head.get("origin") ??
      "http://localhost:3000";

    // Créer la session Checkout Stripe (destination charge).
    // Stripe collecte l'adresse de livraison (shipping_address_collection) :
    // elle sera enregistrée sur la commande au moment du paiement.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: produitsCents,
            product_data: {
              name: `${listing.title} — ${quantite} ${listing.unit.toLowerCase()}`,
              description: `Commande auprès de ${listing.producer.displayName}`,
            },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: fraisPortCents,
            product_data: {
              name: "Frais de port",
              description: "Livraison à domicile — Mondial Relay",
            },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: commissionCents + fraisPortCents,
        transfer_data: {
          destination: listing.producer.stripeAccountId!,
        },
      },
      shipping_address_collection: {
        allowed_countries: ["FR"],
      },
      // Téléphone du destinataire : obligatoire pour Mondial Relay domicile
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
      },
      success_url: `${origin}/tableau-de-bord/commandes?paiement=succes&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/tableau-de-bord/commandes?paiement=annule`,
    });

    if (!session.url) {
      return { erreur: "Impossible de créer la session de paiement." };
    }

    redirect(session.url);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }

    const messageStripe =
      err instanceof Error ? err.message : "Erreur inconnue";

    console.error("Erreur checkout Stripe :", messageStripe);

    return {
      erreur: `Erreur Stripe : ${messageStripe}`,
    };
  }
}
