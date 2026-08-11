import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { deconnexionAction } from "@/lib/actions/auth";
import { countUnreadMessages } from "@/lib/actions/messagerie";
import { countNouvellesCommandes } from "@/lib/actions/commandes";
import { IconeFourche, IconeFourchette } from "@/components/icones";

export default async function LayoutTableauDeBord({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const estProducteur = user.role === "PRODUCTEUR";
  const nonLus = await countUnreadMessages();
  const commandesEnAttente = await countNouvellesCommandes();

  const liens = [
    { href: "/tableau-de-bord", label: "Accueil" },
    ...(estProducteur
      ? [{ href: "/tableau-de-bord/annonces", label: "Mes annonces" }]
      : []),
    { href: "/tableau-de-bord/commandes", label: "Commandes" },
    { href: "/tableau-de-bord/messagerie", label: "Messagerie" },
    { href: "/tableau-de-bord/profil", label: "Mon profil" },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
      {/* Menu latéral */}
      <aside className="md:w-60 md:shrink-0">
        <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-4">
          <p className="flex items-center gap-2.5 border-b-2 border-encre/10 px-2 pb-3 text-sm font-bold text-encre">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-encre bg-ocre/25">
              {estProducteur ? (
                <IconeFourche className="h-5 w-5" />
              ) : (
                <IconeFourchette className="h-5 w-5" />
              )}
            </span>
            {user.displayName}
          </p>
          <nav className="mt-2 flex flex-row gap-1 overflow-x-auto md:flex-col">
            {liens.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                className="flex items-center justify-between whitespace-nowrap rounded-sm px-3 py-2 text-sm font-medium text-encre transition-colors hover:bg-platre-fonce hover:text-outremer"
              >
                {lien.label}
                {lien.href === "/tableau-de-bord/messagerie" && nonLus > 0 && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-garance px-1.5 text-[11px] font-bold text-platre">
                    {nonLus}
                  </span>
                )}
                {lien.href === "/tableau-de-bord/commandes" &&
                  commandesEnAttente > 0 && (
                    <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-garance px-1.5 text-[11px] font-bold text-platre">
                      {commandesEnAttente}
                    </span>
                  )}
              </Link>
            ))}
          </nav>
          <form
            action={deconnexionAction}
            className="mt-3 border-t-2 border-encre/10 pt-3"
          >
            <button
              type="submit"
              className="w-full rounded-sm px-3 py-2 text-left text-sm font-medium text-encre-doux transition-colors hover:bg-garance/10 hover:text-garance"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* Contenu */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
