// Génération du bordereau d'envoi Mondial Relay pour une commande payée.
// Appelé depuis traiterCommandePayee (juste après la facturation) : le bordereau
// est prêt dès le paiement, le vendeur n'a plus qu'à le télécharger.
//
// Contrat : cette fonction ne lève JAMAIS et est IDEMPOTENTE (webhook rejoué,
// double entrée webhook/page de retour, rattrapage via /api/test-bordereau).
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { creerBordereau, clientMondialRelayConfigure } from "./mondial-relay";

/** URL publique du suivi de colis Mondial Relay. */
function urlSuivi(numeroExpedition: string): string {
  return `https://www.mondialrelay.fr/suivi-de-colis?Expedition=${encodeURIComponent(numeroExpedition)}`;
}

export async function genererBordereau(
  orderId: string,
): Promise<{ ok: boolean; erreurs: string[] }> {
  const erreurs: string[] = [];

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { select: { id: true, email: true, phone: true } },
        items: {
          include: {
            listing: {
              select: {
                id: true,
                poidsGrammes: true,
                producer: {
                  select: {
                    id: true,
                    displayName: true,
                    address: true,
                    city: true,
                    postalCode: true,
                    phone: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) return { ok: false, erreurs: ["Commande introuvable"] };
    if (order.status !== "PAID") {
      return { ok: false, erreurs: [`Commande non payée (statut : ${order.status})`] };
    }

    // Idempotence : bordereau déjà généré et archivé
    if (order.bordereauPath) return { ok: true, erreurs: [] };

    if (order.deliveryStatus !== "NOT_SHIPPED") {
      return { ok: false, erreurs: ["Commande déjà expédiée ou livrée"] };
    }

    if (!order.shippingAddressLigne1 || !order.shippingAddressCP) {
      return {
        ok: false,
        erreurs: [
          "Adresse de livraison manquante (collectée par Stripe au paiement).",
        ],
      };
    }

    if (!clientMondialRelayConfigure()) {
      return {
        ok: false,
        erreurs: [
          "Mondial Relay non configuré (MONDIAL_RELAY_USER / _PASSWORD / _CUSTOMER_ID manquantes).",
        ],
      };
    }

    const producteur = order.items[0]?.listing.producer;
    if (!producteur) return { ok: false, erreurs: ["Commande sans producteur"] };

    const poidsTotal = order.items.reduce(
      (somme, item) => somme + Math.round(item.listing.poidsGrammes * item.quantity),
      0,
    );

    // 1) Créer le bordereau chez Mondial Relay (sandbox ou prod selon MONDIAL_RELAY_URL)
    const bordereau = await creerBordereau({
      orderId: order.id,
      expediteur: {
        nom: producteur.displayName,
        ligne1: producteur.address ?? "—",
        codePostal: producteur.postalCode ?? "",
        ville: producteur.city ?? "",
        pays: "FR",
        telephone: producteur.phone,
        email: producteur.email,
      },
      destinataire: {
        nom: order.shippingAddressNom ?? "—",
        ligne1: order.shippingAddressLigne1,
        ligne2: order.shippingAddressLigne2,
        codePostal: order.shippingAddressCP,
        ville: order.shippingAddressVille ?? "",
        pays: order.shippingAddressPays ?? "FR",
        telephone: order.shippingAddressTel,
        email: order.buyer.email,
      },
      poidsGrammes: poidsTotal,
    });

    // 2) Archiver le PDF dans le bucket privé (l'URL Mondial Relay expire)
    let pdf: Uint8Array;
    try {
      const reponse = await fetch(bordereau.urlPdf);
      if (!reponse.ok) {
        throw new Error(`Téléchargement du PDF : HTTP ${reponse.status}`);
      }
      pdf = new Uint8Array(await reponse.arrayBuffer());
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Bordereau créé mais PDF inaccessible : ${msg}`);
    }

    const chemin = `bordereaux/${orderId}/bordereau.pdf`;
    const admin = createAdminClient();
    const { error: erreurUpload } = await admin.storage
      .from("bordereaux")
      .upload(chemin, pdf, { contentType: "application/pdf", upsert: true });
    if (erreurUpload) {
      throw new Error(`Upload Supabase : ${erreurUpload.message}`);
    }

    // 3) Mettre à jour la commande : suivi rempli automatiquement
    await prisma.order.update({
      where: { id: orderId },
      data: {
        bordereauNumeroExpedition: bordereau.numeroExpedition,
        bordereauPath: chemin,
        shippingCarrier: "Mondial Relay",
        shippingTrackingNumber: bordereau.numeroExpedition,
        shippingTrackingUrl: urlSuivi(bordereau.numeroExpedition),
      },
    });

    return { ok: true, erreurs };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[bordereau] échec commande ${orderId} :`, msg);
    return { ok: false, erreurs: [...erreurs, msg] };
  }
}
