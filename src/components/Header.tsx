import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-creme-fonce bg-creme/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>
            🍴
          </span>
          <span className="font-titre text-xl font-bold text-foret">
            Fourchette <span className="text-terre">&amp;</span> Fourche
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/annonces"
            className="text-sm font-medium text-brun transition-colors hover:text-foret"
          >
            Annonces
          </Link>
          <Link
            href="/producteurs"
            className="text-sm font-medium text-brun transition-colors hover:text-foret"
          >
            Producteurs
          </Link>
          <Link
            href="/connexion"
            className="text-sm font-medium text-brun transition-colors hover:text-foret"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-terre px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terre-fonce"
          >
            Publier une annonce
          </Link>
        </nav>

        {/* Menu mobile simplifié */}
        <nav className="flex items-center gap-3 md:hidden">
          <Link href="/annonces" className="text-sm font-medium text-brun">
            Annonces
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-terre px-3 py-1.5 text-sm font-semibold text-white"
          >
            S&apos;inscrire
          </Link>
        </nav>
      </div>
    </header>
  );
}
