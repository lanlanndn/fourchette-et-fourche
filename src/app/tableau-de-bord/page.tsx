import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import ActiverPaiements from "@/components/ActiverPaiements";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function TableauDeBordPage() {
  const user = await requireUser();
  const estProducteur = user.role === "PRODUCTEUR";
  const profilIncomplet = !user.lat || !user.city;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-affiche text-3xl text-encre uppercase">
          Bonjour {user.displayName}
        </h1>
        <p className="mt-1 text-sm text-encre-doux">
          {estProducteur
            ? "Bienvenue sur votre espace producteur."
            : "Bienvenue sur votre espace restaurateur."}
        </p>
      </div>

      {profilIncomplet && (
        <div className="relief-doux border-2 border-encre bg-ocre/20 p-5">
          <p className="font-bold text-encre">
            Dernière étape : votre adresse
          </p>
          <p className="mt-1 text-sm text-encre">
            {estProducteur
              ? "Indiquez l'adresse de votre exploitation pour que les restaurateurs de votre région vous trouvent sur la carte."
              : "Indiquez l'adresse de votre restaurant pour voir les producteurs autour de vous."}
          </p>
          <Link
            href="/tableau-de-bord/profil"
            className="mt-3 inline-block rounded-sm border-2 border-encre bg-garance px-5 py-2 text-sm font-bold tracking-wide text-platre uppercase transition-colors hover:bg-garance-fonce"
          >
            Compléter mon profil
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {estProducteur ? (
          <>
            <Link
              href="/tableau-de-bord/annonces"
              className="relief-doux block border-2 border-encre bg-[#fbf7ec] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgb(40_34_27/0.6)]"
            >
              <h2 className="font-affiche text-xl tracking-wide uppercase">
                Mes annonces
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-encre-doux">
                Publiez vos produits avec photos et prix. Apparaissez sur la
                carte !
              </p>
            </Link>
            <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-6">
              <h2 className="font-affiche text-xl tracking-wide uppercase">
                Recevoir mes paiements
              </h2>
              <div className="mt-2">
                <ActiverPaiements
                  stripeAccountId={user.stripeAccountId}
                  stripeOnboardingComplete={user.stripeOnboardingComplete}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/annonces"
              className="relief-doux border-2 border-encre bg-[#fbf7ec] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgb(40_34_27/0.6)]"
            >
              <h2 className="font-affiche text-xl tracking-wide uppercase">
                Explorer les annonces
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-encre-doux">
                Découvrez les producteurs de votre région sur la carte.
              </p>
            </Link>
            <Link
              href="/tableau-de-bord/commandes"
              className="relief-doux block border-2 border-encre bg-[#fbf7ec] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgb(40_34_27/0.6)]"
            >
              <h2 className="font-affiche text-xl tracking-wide uppercase">
                Mes commandes
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-encre-doux">
                Suivez vos commandes en cours et votre historique d&apos;achats.
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
