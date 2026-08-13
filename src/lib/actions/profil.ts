"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { geocoderAdresse } from "@/lib/geo";
import type { EtatFormulaire } from "@/lib/actions/auth";

const schemaProfil = z.object({
  displayName: z.string().min(2, "Le nom doit faire au moins 2 caractères."),
  phone: z.string().optional(),
  bio: z.string().max(1000, "1000 caractères maximum.").optional(),
  siret: z
    .string()
    .regex(/^(\d{14})?$/, "Le SIRET doit contenir 14 chiffres.")
    .optional(),
  tvaIntracom: z
    .string()
    .regex(/^(FR[0-9A-Za-z]{11})?$/, "Format attendu : FR suivi de 11 caractères (ex : FR12345678901).")
    .optional(),
  adresse: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  emailNotifications: z.boolean().optional(),
});

export async function updateProfilAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const user = await requireUser();

  const brut = {
    displayName: formData.get("displayName"),
    phone: formData.get("phone") || undefined,
    bio: formData.get("bio") || undefined,
    siret: formData.get("siret") || undefined,
    tvaIntracom: formData.get("tvaIntracom") || undefined,
    adresse: formData.get("adresse") || undefined,
    certifications: formData.getAll("certifications").map(String),
    emailNotifications: formData.get("emailNotifications") === "on",
  };

  const validation = schemaProfil.safeParse(brut);
  if (!validation.success) {
    return { erreur: validation.error.issues[0].message };
  }
  const { displayName, phone, bio, siret, tvaIntracom, adresse, certifications, emailNotifications } =
    validation.data;

  // Géocodage de l'adresse si elle est renseignée
  let geo: Awaited<ReturnType<typeof geocoderAdresse>> = null;
  if (adresse) {
    geo = await geocoderAdresse(adresse);
    if (!geo) {
      return {
        erreur:
          "Je n'ai pas trouvé cette adresse. Essaie avec le numéro, la rue, le code postal et la ville.",
      };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName,
      phone: phone ?? null,
      bio: bio ?? null,
      siret: siret || null,
      tvaIntracom: tvaIntracom ? tvaIntracom.toUpperCase() : null,
      certifications: certifications ?? [],
      emailNotifications: emailNotifications ?? true,
      ...(geo && {
        address: geo.adresse,
        city: geo.ville,
        postalCode: geo.codePostal,
        departement: geo.codeDepartement,
        region: geo.codeRegion,
        lat: geo.lat,
        lng: geo.lng,
      }),
    },
  });

  revalidatePath("/tableau-de-bord/profil");

  return {
    succes: geo
      ? `Profil enregistré ! 📍 Adresse localisée : ${geo.adresse}`
      : "Profil enregistré !",
  };
}
