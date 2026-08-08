import type { Listing, User } from "@prisma/client";

// Une annonce avec les infos de son producteur (pour l'affichage)
export type AnnonceAvecProducteur = Listing & {
  producer: Pick<
    User,
    | "id"
    | "displayName"
    | "city"
    | "departement"
    | "region"
    | "certifications"
    | "bio"
    | "avatarUrl"
  >;
};

export type ProducteurAvecAnnonces = User & { listings: Listing[] };

export type FiltresAnnonces = {
  categorie?: string;
  departement?: string;
  region?: string;
  recherche?: string;
  lat?: number;
  lng?: number;
  rayonKm?: number;
};
