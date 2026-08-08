import { prisma } from "@/lib/prisma";
import { distanceKm } from "@/lib/haversine";
import { ANNONCES_DEMO, PRODUCTEURS_DEMO } from "./demo";
import type {
  AnnonceAvecProducteur,
  FiltresAnnonces,
  ProducteurAvecAnnonces,
} from "./types";

// ============================================================
// Couche d'accès aux données.
// Tant que DATABASE_URL n'est pas configurée → données de démo.
// Dès que la base est branchée → vraies données (Prisma).
// Les pages ne changent jamais, seul ce fichier « décide ».
// ============================================================

const MODE_DEMO = !process.env.DATABASE_URL;

export function estModeDemo(): boolean {
  return MODE_DEMO;
}

// ---------- Annonces ----------

export async function listerAnnonces(
  filtres: FiltresAnnonces = {},
): Promise<AnnonceAvecProducteur[]> {
  if (MODE_DEMO) {
    let annonces = ANNONCES_DEMO.filter((a) => a.isActive);

    if (filtres.categorie) {
      annonces = annonces.filter((a) => a.category === filtres.categorie);
    }
    if (filtres.departement) {
      annonces = annonces.filter(
        (a) => a.departement === filtres.departement,
      );
    }
    if (filtres.region) {
      annonces = annonces.filter((a) => a.region === filtres.region);
    }
    if (filtres.recherche) {
      const q = filtres.recherche.toLowerCase();
      annonces = annonces.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description ?? "").toLowerCase().includes(q) ||
          a.producer.displayName.toLowerCase().includes(q),
      );
    }
    if (filtres.lat && filtres.lng && filtres.rayonKm) {
      annonces = annonces.filter(
        (a) =>
          a.lat &&
          a.lng &&
          distanceKm(filtres.lat!, filtres.lng!, a.lat, a.lng) <=
            filtres.rayonKm!,
      );
    }

    return annonces.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  // Mode base de données
  const annonces = await prisma.listing.findMany({
    where: {
      isActive: true,
      ...(filtres.categorie && {
        category: filtres.categorie as never,
      }),
      ...(filtres.departement && { departement: filtres.departement }),
      ...(filtres.region && { region: filtres.region }),
      ...(filtres.recherche && {
        OR: [
          { title: { contains: filtres.recherche, mode: "insensitive" } },
          { description: { contains: filtres.recherche, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      producer: {
        select: {
          id: true,
          displayName: true,
          city: true,
          departement: true,
          region: true,
          certifications: true,
          bio: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filtre par distance (post-filtrage en mémoire — PostGIS n'est pas activé)
  if (filtres.lat && filtres.lng && filtres.rayonKm) {
    return annonces.filter(
      (a) =>
        a.lat &&
        a.lng &&
        distanceKm(filtres.lat!, filtres.lng!, a.lat, a.lng) <=
          filtres.rayonKm!,
    );
  }

  return annonces;
}

export async function getAnnonce(
  id: string,
): Promise<AnnonceAvecProducteur | null> {
  if (MODE_DEMO) {
    return ANNONCES_DEMO.find((a) => a.id === id) ?? null;
  }
  return prisma.listing.findUnique({
    where: { id },
    include: {
      producer: {
        select: {
          id: true,
          displayName: true,
          city: true,
          departement: true,
          region: true,
          certifications: true,
          bio: true,
          avatarUrl: true,
        },
      },
    },
  });
}

// ---------- Producteurs ----------

export async function listerProducteurs(): Promise<ProducteurAvecAnnonces[]> {
  if (MODE_DEMO) {
    return PRODUCTEURS_DEMO;
  }
  return prisma.user.findMany({
    where: { role: "PRODUCTEUR" },
    include: { listings: { where: { isActive: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProducteur(
  id: string,
): Promise<ProducteurAvecAnnonces | null> {
  if (MODE_DEMO) {
    return PRODUCTEURS_DEMO.find((p) => p.id === id) ?? null;
  }
  return prisma.user.findFirst({
    where: { id, role: "PRODUCTEUR" },
    include: {
      listings: { where: { isActive: true }, orderBy: { createdAt: "desc" } },
    },
  });
}

// ---------- Annonces d'un producteur ----------

export async function listerAnnoncesProducteur(
  producteurId: string,
): Promise<AnnonceAvecProducteur[]> {
  if (MODE_DEMO) {
    return ANNONCES_DEMO.filter((a) => a.producerId === producteurId).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }
  return prisma.listing.findMany({
    where: { producerId: producteurId },
    include: {
      producer: {
        select: {
          id: true,
          displayName: true,
          city: true,
          departement: true,
          region: true,
          certifications: true,
          bio: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
