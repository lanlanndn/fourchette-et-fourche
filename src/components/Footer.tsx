import Link from "next/link";
import MarqueFF from "@/components/MarqueFF";

export default function Footer() {
  return (
    <footer className="grain grain-mur border-t-2 border-encre bg-outremer-nuit text-platre">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div>
            <p className="flex items-center gap-3">
              <MarqueFF className="h-10 w-10" />
              <span className="font-affiche text-xl tracking-wide uppercase">
                Fourchette <span className="text-ocre">&amp;</span> Fourche
              </span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-platre/75">
              La marketplace qui relie les restaurateurs aux producteurs
              locaux. Du champ à l&apos;assiette, en direct.
            </p>
          </div>

          <div className="flex gap-14">
            <div>
              <p className="etiquette text-ocre">Marketplace</p>
              <ul className="mt-4 space-y-2.5 text-sm text-platre/85">
                <li>
                  <Link href="/annonces" className="transition-colors hover:text-ocre">
                    Toutes les annonces
                  </Link>
                </li>
                <li>
                  <Link href="/producteurs" className="transition-colors hover:text-ocre">
                    Annuaire des producteurs
                  </Link>
                </li>
                <li>
                  <Link href="/inscription" className="transition-colors hover:text-ocre">
                    Devenir vendeur
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="etiquette text-ocre">Légal</p>
              <ul className="mt-4 space-y-2.5 text-sm text-platre/85">
                <li>
                  <Link href="/mentions-legales" className="transition-colors hover:text-ocre">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/cgv" className="transition-colors hover:text-ocre">
                    CGV
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politique-confidentialite"
                    className="transition-colors hover:text-ocre"
                  >
                    Confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-platre/20 pt-6 text-xs text-platre/70">
          <p>
            © {new Date().getFullYear()} Fourchette &amp; Fourche — Du champ à
            l&apos;assiette, en direct.
          </p>
        </div>
      </div>
    </footer>
  );
}
