// Orchestration de la facturation : à chaque commande payée, génère 3 factures
// Factur-X (FA acheteur, FV vente autofacturée, FC commission), les stocke dans
// Supabase (bucket privé) et les envoie par email avec pièces jointes.
//
// Contrat : cette fonction ne lève JAMAIS et est IDEMPOTENTE (webhook Stripe
// rejoué, double entrée webhook/page de retour, rattrapage manuel).
import { Prisma, type Invoice, type InvoiceType, type User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UNITES } from "@/lib/constantes";
import { envoyerEmail } from "@/lib/emails/envoi";
import {
  emailFactureAcheteur,
  emailFacturesProducteur,
} from "@/lib/emails/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { construirePdfFacturX } from "./pdf";
import { construireXmlFacturX } from "./xml";
import { formaterNumero } from "./numeros";
import {
  CODES_UNITE_UNECE,
  TAUX_TVA_COMMISSION_BP,
  anneeFacturation,
  infosSociete,
  ventilerTva,
} from "./constantes";
import type {
  LigneFacture,
  PartieFacture,
  PayloadFacture,
  TypeFacture,
  VentilationTva,
} from "./types";

const TYPES_A_GENERER: TypeFacture[] = ["ACHETEUR", "VENTE", "COMMISSION"];

// ---------- Helpers ----------

/** Convertit un utilisateur Prisma en partie de facture. */
function partieDepuisUser(user: User): PartieFacture {
  return {
    nom: user.displayName,
    siret: user.siret || undefined,
    tvaIntracom: user.tvaIntracom || undefined,
    adresse: user.address || "—",
    codePostal: user.postalCode || "—",
    ville: user.city || "—",
    pays: "FR",
  };
}

/** Partie "société" de la plateforme (env vars, « à compléter » si vides). */
function partieSociete(): PartieFacture {
  const s = infosSociete();
  return {
    nom: s.nom,
    siret: s.siret || undefined,
    tvaIntracom: s.tvaIntracom || undefined,
    adresse: s.adresse || "—",
    codePostal: s.codePostal || "—",
    ville: s.ville || "—",
    pays: "FR",
  };
}

/** Regroupe les lignes par taux de TVA (tri croissant). */
function ventilerParTaux(lignes: LigneFacture[]): VentilationTva[] {
  const parTaux = new Map<number, VentilationTva>();
  for (const ligne of lignes) {
    const courant = parTaux.get(ligne.tauxTvaBp) ?? {
      tauxBp: ligne.tauxTvaBp,
      baseHtCents: 0,
      tvaCents: 0,
    };
    courant.baseHtCents += ligne.montantHtCents;
    courant.tvaCents += ligne.montantTvaCents;
    parTaux.set(ligne.tauxTvaBp, courant);
  }
  return [...parTaux.values()].sort((a, b) => a.tauxBp - b.tauxBp);
}

// ---------- Attribution du numéro (avec retry sur conflit) ----------

type CommandeComplet = Prisma.OrderGetPayload<{
  include: {
    buyer: true;
    items: { include: { listing: { include: { producer: true } } } };
  };
}>;

async function creerFactureAvecNumero(data: {
  type: InvoiceType;
  annee: number;
  orderId: string;
  emitPourUserId: string | null;
  montantHtCents: number;
  tvaCents: number;
  montantTtcCents: number;
}): Promise<Invoice> {
  for (let tentative = 0; tentative < 5; tentative++) {
    try {
      const dernier = await prisma.invoice.findFirst({
        where: { type: data.type, annee: data.annee },
        orderBy: { sequence: "desc" },
        select: { sequence: true },
      });
      const sequence = (dernier?.sequence ?? 0) + 1;
      return await prisma.invoice.create({
        data: {
          ...data,
          sequence,
          numero: formaterNumero(data.type, data.annee, sequence),
          storagePath: "",
        },
      });
    } catch (err) {
      // Conflit rare sur @@unique([type, sequence, annee]) → on recalcule et réessaie
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        continue;
      }
      throw err;
    }
  }
  throw new Error("Impossible d'attribuer un numéro de facture après 5 tentatives.");
}

// ---------- Génération ----------

export async function genererFacturesCommande(
  orderId: string,
): Promise<{ ok: boolean; factures: string[]; erreurs: string[] }> {
  const erreurs: string[] = [];
  const factures: string[] = [];

  try {
    // 1) Commande complète (adresses et SIRET des deux parties)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        items: { include: { listing: { include: { producer: true } } } },
      },
    });
    if (!order) {
      return { ok: false, factures, erreurs: ["Commande introuvable"] };
    }
    if (order.status !== "PAID") {
      return {
        ok: false,
        factures,
        erreurs: [`Commande non payée (statut : ${order.status})`],
      };
    }

    const producteur = order.items[0]?.listing.producer;
    if (!producteur) {
      return { ok: false, factures, erreurs: ["Commande sans producteur"] };
    }

    // 2) Idempotence : on saute les types déjà générés (storagePath rempli) ;
    //    une ligne sans storagePath (upload raté) est régénérée ci-dessous.
    const existantes = await prisma.invoice.findMany({
      where: { orderId },
      select: { id: true, type: true, numero: true, storagePath: true },
    });
    const existanteParType = new Map(existantes.map((f) => [f.type, f]));

    const dateEmission = new Date();
    const annee = anneeFacturation(dateEmission);

    const generes: Array<{ type: TypeFacture; numero: string; pdf: Uint8Array }> = [];

    for (const type of TYPES_A_GENERER) {
      const existante = existanteParType.get(type);
      if (existante && existante.storagePath) continue; // déjà générée

      try {
        const payload = construirePayload(
          type,
          order,
          producteur,
          existante?.numero ?? formaterNumero(type, annee, 0),
          annee,
          dateEmission,
        );
        const xml = construireXmlFacturX(payload);
        const pdf = await construirePdfFacturX(payload, xml);

        // Row en base (numéro attribué) — ou réutilisation de la row existante
        const row = existante
          ? await prisma.invoice.update({
              where: { id: existante.id },
              data: { numero: payload.numero },
            })
          : await creerFactureAvecNumero({
              type: type as InvoiceType,
              annee,
              orderId,
              emitPourUserId: type === "ACHETEUR" ? null : producteur.id,
              montantHtCents: payload.totalHtCents,
              tvaCents: payload.totalTvaCents,
              montantTtcCents: payload.totalTtcCents,
            });

        // Upload dans le bucket privé
        const chemin = `factures/${orderId}/${row.numero}.pdf`;
        const admin = createAdminClient();
        const { error: erreurUpload } = await admin.storage
          .from("factures")
          .upload(chemin, pdf, { contentType: "application/pdf", upsert: true });
        if (erreurUpload) throw new Error(`Upload Supabase : ${erreurUpload.message}`);

        await prisma.invoice.update({
          where: { id: row.id },
          data: { storagePath: chemin },
        });

        factures.push(row.numero);
        generes.push({ type, numero: row.numero, pdf });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[facturation] échec ${type} commande ${orderId} :`, msg);
        erreurs.push(`${type} : ${msg}`);
      }
    }

    // 3) Emails (toujours await — jamais fire-and-forget sur Vercel).
    //    Uniquement si au moins une facture vient d'être générée dans ce run.
    if (generes.length === 0) {
      return { ok: erreurs.length === 0, factures, erreurs };
    }

    const generesParType = new Map(generes.map((g) => [g.type, g]));
    const toutes = await prisma.invoice.findMany({
      where: { orderId },
      select: { type: true, numero: true },
    });
    const numeroDe = (type: TypeFacture) =>
      toutes.find((t) => t.type === type)?.numero ?? "";

    const fa = generesParType.get("ACHETEUR");
    if (fa) {
      await envoyerEmail({
        to: order.buyer.email,
        ...emailFactureAcheteur({
          displayName: order.buyer.displayName,
          numeroFacture: numeroDe("ACHETEUR"),
          totalCents: order.totalCents,
          orderId,
        }),
        attachments: [
          {
            filename: `${fa.numero}.pdf`,
            content: Buffer.from(fa.pdf),
            contentType: "application/pdf",
          },
        ],
      });
    }

    const fv = generesParType.get("VENTE");
    const fc = generesParType.get("COMMISSION");
    if (fv || fc) {
      const piecesJointes: Array<{ filename: string; content: Buffer; contentType: string }> = [];
      if (fv) {
        piecesJointes.push({
          filename: `${fv.numero}.pdf`,
          content: Buffer.from(fv.pdf),
          contentType: "application/pdf",
        });
      }
      if (fc) {
        piecesJointes.push({
          filename: `${fc.numero}.pdf`,
          content: Buffer.from(fc.pdf),
          contentType: "application/pdf",
        });
      }
      await envoyerEmail({
        to: producteur.email,
        ...emailFacturesProducteur({
          displayName: producteur.displayName,
          numeroVente: numeroDe("VENTE"),
          numeroCommission: numeroDe("COMMISSION"),
          totalCents: order.totalCents,
          commissionCents: order.commissionCents,
          orderId,
        }),
        attachments: piecesJointes,
      });
    }

    return { ok: erreurs.length === 0, factures, erreurs };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[facturation] erreur inattendue commande ${orderId} :`, msg);
    return { ok: false, factures, erreurs: [...erreurs, msg] };
  }
}

// ---------- Construction du payload par type ----------

function construirePayload(
  type: TypeFacture,
  order: CommandeComplet,
  producteur: User,
  numero: string,
  annee: number,
  dateEmission: Date,
): PayloadFacture {
  const societe = partieSociete();

  // Vendeur : la plateforme (FA, FC) ou le producteur (FV).
  // Acheteur : le restaurateur (FA), la plateforme (FV — le producteur vend à la
  // plateforme dans le modèle commissionnaire) ou le producteur (FC).
  const vendeur = type === "VENTE" ? partieDepuisUser(producteur) : societe;
  const acheteur =
    type === "VENTE"
      ? societe
      : type === "COMMISSION"
        ? partieDepuisUser(producteur)
        : partieDepuisUser(order.buyer);

  let lignes: LigneFacture[];
  if (type === "COMMISSION") {
    const taux = TAUX_TVA_COMMISSION_BP;
    const { htCents, tvaCents } = ventilerTva(order.commissionCents, taux);
    lignes = [
      {
        nom: `Commission de mise en relation — commande ${order.id}`,
        quantite: 1,
        uniteCode: "C62",
        uniteLibelle: "service",
        prixUnitaireTtcCents: order.commissionCents,
        montantTtcCents: order.commissionCents,
        tauxTvaBp: taux,
        montantHtCents: htCents,
        montantTvaCents: tvaCents,
      },
    ];
  } else {
    lignes = order.items.map((item) => {
      const taux = item.listing.tvaCents;
      const { htCents, tvaCents } = ventilerTva(item.subtotalCents, taux);
      return {
        nom: item.listing.title,
        quantite: item.quantity,
        uniteCode: CODES_UNITE_UNECE[item.listing.unit] ?? "C62",
        uniteLibelle: UNITES[item.listing.unit] ?? "pièce",
        prixUnitaireTtcCents: item.unitPriceCents,
        montantTtcCents: item.subtotalCents,
        tauxTvaBp: taux,
        montantHtCents: htCents,
        montantTvaCents: tvaCents,
      };
    });
  }

  const ventilation = ventilerParTaux(lignes);
  const totalHtCents = lignes.reduce((somme, l) => somme + l.montantHtCents, 0);
  const totalTvaCents = lignes.reduce((somme, l) => somme + l.montantTvaCents, 0);
  const totalTtcCents = lignes.reduce((somme, l) => somme + l.montantTtcCents, 0);

  return {
    type,
    numero,
    annee,
    dateEmission,
    vendeur,
    acheteur,
    lignes,
    ventilation,
    totalHtCents,
    totalTvaCents,
    totalTtcCents,
    referenceCommande: order.id,
    referencePaiement:
      type === "ACHETEUR" ? order.stripePaymentIntentId ?? undefined : undefined,
    estPayee: true,
    mentionAutofacturation: type === "VENTE",
  };
}
