"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { geocoderAdresse } from "@/lib/geo";
import type { EtatFormulaire } from "@/lib/actions/auth";

// ---------- Validation ----------

const CATEGORIES_IDS = [
  "LEGUMES", "FRUITS", "VIANDE", "VOLAILLE", "POISSON", "FRUITS_DE_MER",
  "FROMAGE", "PRODUITS_LAITIERS", "OEUFS", "VIN", "BIERE", "BOISSONS",
  "MIEL", "EPICERIE", "FARINE", "HUILE", "HERBES_AROMATES", "FLEURS", "AUTRE",
] as const;

const UNITES_IDS = [
  "KG", "GRAMMES", "PIECE", "LITRE", "BOUTEILLE", "BOTTE", "SAC", "CAISSE", "DOUZAINE",
] as const;

const schemaAnnonce = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères.").max(100, "100 caractères maximum."),
  description: z.string().max(2000, "2000 caractères maximum.").optional(),
  category: z.enum(CATEGORIES_IDS, { message: "Choisis une catégorie." }),
  prixEuros: z.string().regex(/^\d+([.,]\d{1,2})?$/, "Prix invalide (ex : 3,50)."),
  unit: z.enum(UNITES_IDS, { message: "Choisis une unité." }),
  quantityAvailable: z.coerce.number().int().min(1, "La quantité doit être d'au moins 1."),
  certifications: z.array(z.string()).optional(),
  adresse: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

// ---------- Helpers ----------

/** Convertit un prix saisi en euros ("3,50" ou "3.50") en centimes (350). */
function eurosVersCentimes(valeur: string): number {
  const normalise = valeur.replace(",", ".");
  return Math.round(parseFloat(normalise) * 100);
}

/** Vérifie qu'une annonce appartient à l'utilisateur connecté. */
async function verifierProprietaire(listingId: string, userId: string) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.producerId !== userId) {
    throw new Error("Cette annonce ne vous appartient pas.");
  }
  return listing;
}

// ---------- Création ----------

export async function createListingAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const user = await requireUser();
  if (user.role !== "PRODUCTEUR") {
    return { erreur: "Seuls les producteurs peuvent publier des annonces." };
  }

  const brut = {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    prixEuros: formData.get("prixEuros"),
    unit: formData.get("unit"),
    quantityAvailable: formData.get("quantityAvailable"),
    certifications: formData.getAll("certifications").map(String),
    adresse: formData.get("adresse") || undefined,
    photos: formData.getAll("photos").map(String).filter(Boolean),
  };

  const validation = schemaAnnonce.safeParse(brut);
  if (!validation.success) {
    return { erreur: validation.error.issues[0].message };
  }
  const { title, description, category, prixEuros, unit, quantityAvailable, certifications, adresse, photos } =
    validation.data;

  const priceCents = eurosVersCentimes(prixEuros);

  // Géocodage si une adresse personnalisée est fournie
  let lat = user.lat;
  let lng = user.lng;
  let address = user.address;
  let city = user.city;
  let departement = user.departement;
  let region = user.region;

  if (adresse && adresse.trim()) {
    const geo = await geocoderAdresse(adresse);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
      address = geo.adresse;
      city = geo.ville;
      departement = geo.codeDepartement;
      region = geo.codeRegion;
    } else {
      return { erreur: "Adresse introuvable. Vérifie le numéro, la rue, le code postal et la ville." };
    }
  }

  if (!departement || !region) {
    return { erreur: "Complète ton adresse dans ton profil d'abord, ou saisis une adresse pour cette annonce." };
  }

  await prisma.listing.create({
    data: {
      producerId: user.id,
      title,
      description: description ?? null,
      category: category as never,
      priceCents,
      unit: unit as never,
      quantityAvailable,
      certifications: certifications ?? [],
      photos: photos ?? [],
      address,
      city,
      departement,
      region,
      lat: lat!,
      lng: lng!,
    },
  });

  revalidatePath("/tableau-de-bord/annonces");
  revalidatePath("/annonces");
  redirect("/tableau-de-bord/annonces");
}

// ---------- Modification ----------

export async function updateListingAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const user = await requireUser();
  const listingId = formData.get("listingId") as string;
  if (!listingId) return { erreur: "Annonce manquante." };

  await verifierProprietaire(listingId, user.id);

  const brut = {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    prixEuros: formData.get("prixEuros"),
    unit: formData.get("unit"),
    quantityAvailable: formData.get("quantityAvailable"),
    certifications: formData.getAll("certifications").map(String),
    adresse: formData.get("adresse") || undefined,
    photos: formData.getAll("photos").map(String).filter(Boolean),
  };

  const validation = schemaAnnonce.safeParse(brut);
  if (!validation.success) {
    return { erreur: validation.error.issues[0].message };
  }
  const { title, description, category, prixEuros, unit, quantityAvailable, certifications, adresse, photos } =
    validation.data;

  const priceCents = eurosVersCentimes(prixEuros);

  // Géocodage si l'adresse a changé
  let geoData: Record<string, unknown> = {};
  if (adresse && adresse.trim()) {
    const geo = await geocoderAdresse(adresse);
    if (geo) {
      geoData = {
        address: geo.adresse,
        city: geo.ville,
        departement: geo.codeDepartement,
        region: geo.codeRegion,
        lat: geo.lat,
        lng: geo.lng,
      };
    } else {
      return { erreur: "Adresse introuvable. Vérifie le numéro, la rue, le code postal et la ville." };
    }
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title,
      description: description ?? null,
      category: category as never,
      priceCents,
      unit: unit as never,
      quantityAvailable,
      certifications: certifications ?? [],
      photos: photos ?? [],
      ...geoData,
    },
  });

  revalidatePath("/tableau-de-bord/annonces");
  revalidatePath(`/tableau-de-bord/annonces/${listingId}/modifier`);
  revalidatePath("/annonces");
  revalidatePath(`/annonces/${listingId}`);

  return { succes: "Annonce enregistrée !" };
}

// ---------- Activation / désactivation ----------

export async function toggleListingAction(listingId: string) {
  const user = await requireUser();
  await verifierProprietaire(listingId, user.id);

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return;

  await prisma.listing.update({
    where: { id: listingId },
    data: { isActive: !listing.isActive },
  });

  revalidatePath("/tableau-de-bord/annonces");
  revalidatePath("/annonces");
}

// ---------- Suppression ----------

export async function deleteListingAction(listingId: string) {
  const user = await requireUser();
  await verifierProprietaire(listingId, user.id);

  await prisma.listing.delete({ where: { id: listingId } });

  revalidatePath("/tableau-de-bord/annonces");
  revalidatePath("/annonces");
}
