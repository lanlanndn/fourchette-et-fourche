import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import MarqueFF from "@/components/MarqueFF";
import { deconnexionAction } from "@/lib/actions/auth";

export default async function Header() {
  const user = await getCurrentUser();
  const estConnecte = !!user;

  return (
    <header className="sticky top-0 z-50 border-b-2 border-encre bg-platre">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Marque */}
        <Link href="/" className="flex items-center gap-2.5">
          <MarqueFF className="h-9 w-9" />
          <span className="font-affiche text-base leading-none tracking-wide text-outremer uppercase md:text-xl">
            Fourchette <span className="text-garance">&amp;</span> Fourche
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/annonces"
            className="etiquette text-encre transition-colors hover:text-garance"
          >
            Annonces
          </Link>
          <Link
            href="/producteurs"
            className="etiquette text-encre transition-colors hover:text-garance"
          >
            Producteurs
          </Link>

          {estConnecte ? (
            <>
              <Link
                href="/tableau-de-bord"
                className="etiquette text-encre transition-colors hover:text-garance"
              >
                Tableau de bord
              </Link>
              <form action={deconnexionAction}>
                <button
                  type="submit"
                  className="etiquette cursor-pointer text-encre-doux transition-colors hover:text-garance"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="etiquette text-encre transition-colors hover:text-garance"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="relief rounded-sm border-2 border-encre bg-garance px-4 py-2 text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-garance-fonce hover:shadow-[6px_6px_0_0_rgb(40_34_27/0.9)]"
              >
                Publier une annonce
              </Link>
            </>
          )}
        </nav>

        {/* Menu mobile */}
        <nav className="flex items-center gap-3 md:hidden">
          <Link href="/annonces" className="etiquette text-encre">
            Annonces
          </Link>
          {estConnecte ? (
            <Link
              href="/tableau-de-bord"
              className="rounded-sm border-2 border-encre bg-outremer px-3 py-1.5 text-xs font-bold tracking-wide text-platre uppercase"
            >
              Compte
            </Link>
          ) : (
            <Link
              href="/inscription"
              className="rounded-sm border-2 border-encre bg-garance px-3 py-1.5 text-xs font-bold tracking-wide text-platre uppercase"
            >
              S&apos;inscrire
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
