import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { estSupabaseConfigure } from "@/lib/supabase/config";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

// Récupère l'utilisateur connecté (profil complet depuis la base), ou null
export async function getCurrentUser(): Promise<User | null> {
  if (!estSupabaseConfigure()) return null;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  return prisma.user.findUnique({ where: { id: authUser.id } });
}

// Exige un utilisateur connecté, sinon redirige vers /connexion
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

// Exige un rôle précis, sinon redirige vers le tableau de bord
export async function requireRole(
  role: "RESTAURATEUR" | "PRODUCTEUR",
): Promise<User> {
  const user = await requireUser();
  if (user.role !== role) redirect("/tableau-de-bord");
  return user;
}
