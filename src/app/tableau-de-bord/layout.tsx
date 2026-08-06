import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { deconnexionAction } from "@/lib/actions/auth";

export default async function LayoutTableauDeBord({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");

  const estProducteur = user.role === "PRODUCTEUR";

  const liens = [
    { href: "/tableau-de-bord", label: "🏠 Accueil" },
    ...(estProducteur
      ? [{ href: "/tableau-de-bord/annonces", label: "🥕 Mes annonces" }]
      : []),
    { href: "/tableau-de-bord/commandes", label: "📦 Commandes" },
    { href: "/tableau-de-bord/messagerie", label: "💬 Messagerie" },
    { href: "/tableau-de-bord/profil", label: "👤 Mon profil" },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row">
      {/* Menu latéral */}
      <aside className="md:w-56 md:shrink-0">
        <div className="rounded-2xl border border-creme-fonce bg-white p-4">
          <p className="px-2 pb-3 text-sm font-semibold text-brun">
            {estProducteur ? "🚜" : "🍽️"} {user.displayName}
          </p>
          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col">
            {liens.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-brun transition-colors hover:bg-foret-pale/50 hover:text-foret"
              >
                {lien.label}
              </Link>
            ))}
          </nav>
          <form action={deconnexionAction} className="mt-3 border-t border-creme-fonce pt-3">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-brun-clair transition-colors hover:bg-red-50 hover:text-red-600"
            >
              🚪 Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      {/* Contenu */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
