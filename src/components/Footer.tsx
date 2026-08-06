import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-creme-fonce bg-creme-fonce/50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <p className="font-titre text-lg font-bold text-foret">
              🍴 Fourchette <span className="text-terre">&amp;</span> Fourche
            </p>
            <p className="mt-2 max-w-xs text-sm text-brun-clair">
              La marketplace qui relie les restaurateurs aux producteurs
              locaux. Du champ à l&apos;assiette, en direct.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <p className="text-sm font-semibold text-brun">Marketplace</p>
              <ul className="mt-3 space-y-2 text-sm text-brun-clair">
                <li>
                  <Link href="/annonces" className="hover:text-foret">
                    Toutes les annonces
                  </Link>
                </li>
                <li>
                  <Link href="/producteurs" className="hover:text-foret">
                    Annuaire des producteurs
                  </Link>
                </li>
                <li>
                  <Link href="/inscription" className="hover:text-foret">
                    Devenir vendeur
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-brun">Légal</p>
              <ul className="mt-3 space-y-2 text-sm text-brun-clair">
                <li>
                  <Link href="/mentions-legales" className="hover:text-foret">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/cgv" className="hover:text-foret">
                    CGV
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politique-confidentialite"
                    className="hover:text-foret"
                  >
                    Confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-creme-fonce pt-6 text-center text-xs text-brun-clair">
          © {new Date().getFullYear()} Fourchette &amp; Fourche — Fait avec
          ❤️ pour les circuits courts.
        </p>
      </div>
    </footer>
  );
}
