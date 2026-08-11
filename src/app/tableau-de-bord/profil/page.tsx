import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import FormulaireProfil from "@/components/forms/FormulaireProfil";
import ActiverPaiements from "@/components/ActiverPaiements";

export const metadata: Metadata = { title: "Mon profil" };

type Props = { searchParams: Promise<{ stripe?: string }> };

export default async function ProfilPage({ searchParams }: Props) {
  const user = await requireUser();
  const { stripe } = await searchParams;
  const estProducteur = user.role === "PRODUCTEUR";

  // Si on revient de l'onboarding Stripe, vérifier l'état du compte
  let stripeOnboardingComplete = user.stripeOnboardingComplete;
  let messageStripe: "succes" | "refresh" | null = null;

  if (stripe === "succes" || stripe === "refresh") {
    messageStripe = stripe as "succes" | "refresh";

    if (
      estProducteur &&
      user.stripeAccountId &&
      !stripeOnboardingComplete
    ) {
      try {
        const compte = await getStripe().accounts.retrieve(
          user.stripeAccountId,
        );
        if (compte.charges_enabled && compte.details_submitted) {
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeOnboardingComplete: true },
          });
          stripeOnboardingComplete = true;
          messageStripe = "succes";
        } else {
          messageStripe = "refresh";
        }
      } catch {
        // Si l'appel Stripe échoue, on garde l'état actuel
        messageStripe = null;
      }
    }
  }

  return (
    <div>
      <h1 className="font-affiche text-3xl text-encre uppercase">Mon profil</h1>
      <p className="mt-1 text-sm text-encre-doux">
        Ces informations sont visibles par les autres professionnels.
      </p>

      {messageStripe === "succes" && (
        <div className="mt-4 rounded-sm border-2 border-verdigris bg-verdigris/10 px-4 py-3 text-sm font-medium text-verdigris">
          Paiements activés avec succès ! Vous pouvez maintenant recevoir des
          commandes.
        </div>
      )}

      {messageStripe === "refresh" && (
        <div className="mt-4 rounded-sm border-2 border-ocre bg-ocre/20 px-4 py-3 text-sm font-medium text-encre">
          La vérification n&apos;a pas abouti. Vous pouvez recommencer quand vous
          êtes prêt.
        </div>
      )}

      <div className="relief-doux mt-6 border-2 border-encre bg-[#fbf7ec] p-6 md:p-8">
        <FormulaireProfil user={user} />
      </div>

      {estProducteur && (
        <div className="relief-doux mt-6 border-2 border-encre bg-[#fbf7ec] p-6 md:p-8">
          <h2 className="font-affiche text-xl text-encre uppercase">
            Paiements
          </h2>
          <div className="mt-3">
            <ActiverPaiements
              stripeAccountId={user.stripeAccountId}
              stripeOnboardingComplete={stripeOnboardingComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
