import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUTS_COMMANDE, formaterPrix } from "@/lib/constantes";

export const metadata: Metadata = { title: "Commandes" };

type Props = { searchParams: Promise<{ paiement?: string }> };

export default async function CommandesPage({ searchParams }: Props) {
  const user = await requireUser();
  const { paiement } = await searchParams;
  const estProducteur = user.role === "PRODUCTEUR";

  const commandes = await prisma.order.findMany({
    where: estProducteur
      ? { items: { some: { listing: { producerId: user.id } } } }
      : { buyerId: user.id },
    include: {
      items: {
        include: {
          listing: { select: { id: true, title: true, category: true, unit: true, producerId: true } },
        },
      },
      buyer: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-affiche text-3xl text-encre uppercase">Commandes</h1>
      <p className="mt-1 text-sm text-encre-doux">
        {estProducteur
          ? "Suivez les commandes passées auprès de vos annonces."
          : "Retrouvez l'historique de vos achats."}
      </p>

      {paiement === "succes" && (
        <div className="mt-4 rounded-sm border-2 border-verdigris bg-verdigris/10 px-4 py-3 text-sm font-medium text-verdigris">
          Paiement réussi ! Le producteur a été notifié.
        </div>
      )}

      {paiement === "annule" && (
        <div className="mt-4 rounded-sm border-2 border-encre/20 bg-platre-fonce/30 px-4 py-3 text-sm text-encre-doux">
          La commande a été annulée. Vous pouvez réessayer quand vous le
          souhaitez.
        </div>
      )}

      {commandes.length === 0 ? (
        <div className="relief-doux mt-6 border-2 border-encre bg-[#fbf7ec] p-8 text-center">
          <p className="text-sm text-encre-doux">
            {estProducteur
              ? "Aucune commande pour le moment. Quand un restaurateur commandera l'une de vos annonces, elle apparaîtra ici."
              : "Vous n'avez pas encore passé de commande."}
          </p>
          {!estProducteur && (
            <Link
              href="/annonces"
              className="mt-4 inline-block rounded-sm border-2 border-encre bg-garance px-5 py-2.5 text-sm font-bold tracking-wide text-platre uppercase transition-colors hover:bg-garance-fonce"
            >
              Explorer les annonces
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {commandes.map((cmd) => {
            const statut = STATUTS_COMMANDE[cmd.status] ?? {
              label: cmd.status,
              classe: "bg-platre-fonce text-encre-doux",
            };

            return (
              <Link
                key={cmd.id}
                href={`/tableau-de-bord/commandes/${cmd.id}`}
                className="relief-doux flex items-center justify-between border-2 border-encre bg-[#fbf7ec] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgb(40_34_27/0.6)]"
              >
                <div className="min-w-0">
                  <p className="font-texte text-sm font-bold text-encre">
                    {estProducteur
                      ? `Commande de ${cmd.buyer.displayName}`
                      : cmd.items[0]?.listing.title ?? "Commande"}
                    {cmd.items.length > 1 && (
                      <span className="font-normal text-encre-doux">
                        {" "}
                        +{cmd.items.length - 1} article
                        {cmd.items.length > 2 ? "s" : ""}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-encre-doux">
                    {new Date(cmd.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-sm px-2.5 py-1 text-xs font-bold tracking-wider uppercase ${statut.classe}`}
                  >
                    {statut.label}
                  </span>
                  <span className="prix-peint text-xl text-garance">
                    {formaterPrix(cmd.totalCents)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
