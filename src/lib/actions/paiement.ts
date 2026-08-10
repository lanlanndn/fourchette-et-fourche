"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// ---------- Onboarding Stripe Connect (producteurs) ----------

/**
 * Crée ou récupère un compte Stripe Connect Express pour le producteur
 * connecté, puis le redirige vers l'onboarding hébergé par Stripe.
 */
export async function activerPaiementsAction(): Promise<
  { erreur: string } | undefined
> {
  const user = await requireUser();
  if (user.role !== "PRODUCTEUR") {
    return { erreur: "Seuls les producteurs peuvent activer les paiements." };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { erreur: "Les paiements en ligne ne sont pas encore configurés." };
  }

  const head = await headers();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? head.get("origin") ?? "http://localhost:3000";

  let accountId = user.stripeAccountId;

  // Créer le compte Stripe Connect Express s'il n'existe pas encore
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: user.email,
      capabilities: { transfers: { requested: true } },
      business_type: "individual",
      business_profile: {
        name: user.displayName,
        url: origin,
      },
      metadata: { userId: user.id },
    });

    accountId = account.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeAccountId: accountId },
    });
  }

  // Créer un lien d'onboarding (page hébergée par Stripe)
  const lien = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/tableau-de-bord/profil?stripe=refresh`,
    return_url: `${origin}/tableau-de-bord/profil?stripe=succes`,
    type: "account_onboarding",
  });

  redirect(lien.url);
}
