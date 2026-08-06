"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { estSupabaseConfigure } from "@/lib/supabase/config";
import { prisma } from "@/lib/prisma";

export type EtatFormulaire = { erreur?: string; succes?: string } | null;

const ERREUR_CONFIG =
  "Le site est en cours de configuration, les inscriptions ouvrent très bientôt. Réessaie dans quelques instants !";

// ---------- Inscription ----------

const schemaInscription = z.object({
  nom: z.string().min(2, "Indique ton nom ou celui de ton établissement."),
  email: z.string().email("Adresse email invalide."),
  motDePasse: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères."),
  role: z.enum(["RESTAURATEUR", "PRODUCTEUR"], {
    message: "Choisis ton profil : restaurateur ou producteur.",
  }),
});

export async function inscriptionAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  if (!estSupabaseConfigure()) return { erreur: ERREUR_CONFIG };

  const brut = {
    nom: formData.get("nom"),
    email: formData.get("email"),
    motDePasse: formData.get("motDePasse"),
    role: formData.get("role"),
  };
  const validation = schemaInscription.safeParse(brut);
  if (!validation.success) {
    return { erreur: validation.error.issues[0].message };
  }
  const { nom, email, motDePasse, role } = validation.data;

  // Un compte existe déjà ?
  const existant = await prisma.user.findUnique({ where: { email } });
  if (existant) {
    return { erreur: "Un compte existe déjà avec cet email. Connecte-toi !" };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { data, error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: {
      data: { display_name: nom, role },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { erreur: traduireErreurAuth(error.message) };
  }
  if (!data.user) {
    return { erreur: "Une erreur est survenue. Réessaie dans un instant." };
  }

  // Crée le profil dans notre base (même identifiant que le compte Auth)
  await prisma.user.create({
    data: { id: data.user.id, email, displayName: nom, role },
  });

  if (data.session) {
    // Confirmation d'email désactivée → connecté directement
    redirect("/tableau-de-bord");
  }

  return {
    succes:
      "Ton compte est créé ! 📬 Vérifie ta boîte mail et clique sur le lien de confirmation pour te connecter.",
  };
}

// ---------- Connexion ----------

export async function connexionAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  if (!estSupabaseConfigure()) return { erreur: ERREUR_CONFIG };

  const email = String(formData.get("email") ?? "");
  const motDePasse = String(formData.get("motDePasse") ?? "");

  if (!email || !motDePasse) {
    return { erreur: "Indique ton email et ton mot de passe." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  if (error) {
    return { erreur: traduireErreurAuth(error.message) };
  }

  redirect("/tableau-de-bord");
}

// ---------- Déconnexion ----------

export async function deconnexionAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// ---------- Mot de passe oublié ----------

export async function motDePasseOublieAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  if (!estSupabaseConfigure()) return { erreur: ERREUR_CONFIG };

  const email = String(formData.get("email") ?? "");
  if (!email) return { erreur: "Indique ton adresse email." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reinitialiser-mot-de-passe`,
  });

  // Message identique que le compte existe ou non (sécurité)
  return {
    succes:
      "Si un compte existe avec cet email, tu vas recevoir un lien de réinitialisation. 📬",
  };
}

// ---------- Réinitialisation ----------

export async function reinitialiserMotDePasseAction(
  _prev: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const motDePasse = String(formData.get("motDePasse") ?? "");
  if (motDePasse.length < 8) {
    return { erreur: "Le mot de passe doit faire au moins 8 caractères." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: motDePasse });

  if (error) {
    return { erreur: "Le lien a peut-être expiré. Redemande un nouveau lien." };
  }

  redirect("/tableau-de-bord");
}

// ---------- Traduction des erreurs Supabase en français ----------

function traduireErreurAuth(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Email ou mot de passe incorrect.";
  if (message.includes("Email not confirmed"))
    return "Tu dois d'abord confirmer ton email (vérifie ta boîte mail).";
  if (message.includes("User already registered"))
    return "Un compte existe déjà avec cet email.";
  if (message.includes("Password should be"))
    return "Le mot de passe est trop faible (8 caractères minimum).";
  if (message.includes("rate limit"))
    return "Trop de tentatives. Attends quelques minutes et réessaie.";
  return "Une erreur est survenue. Réessaie dans un instant.";
}
