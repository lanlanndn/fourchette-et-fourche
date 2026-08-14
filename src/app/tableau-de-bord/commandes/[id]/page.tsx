import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUTS_COMMANDE, formaterPrix, UNITES } from "@/lib/constantes";
import { nomDepartement } from "@/lib/geo-metadata";
import {
  BADGES_TYPES_FACTURES,
  LIBELLES_COURTS_FACTURES,
} from "@/lib/facturation/constantes";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Commande ${id.slice(0, 8)}` };
}

export default async function CommandeDetailPage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              category: true,
              unit: true,
              producerId: true,
              producer: { select: { id: true, displayName: true, city: true, departement: true } },
            },
          },
        },
      },
      buyer: { select: { id: true, displayName: true } },
      invoices: true,
    },
  });

  if (!order) notFound();

  // Vérifier que l'utilisateur est bien concerné par cette commande
  const estAcheteur = order.buyerId === user.id;
  const estProducteurConcerne = order.items.some(
    (i) => i.listing.producerId === user.id,
  );

  if (!estAcheteur && !estProducteurConcerne) {
    notFound();
  }

  const statut = STATUTS_COMMANDE[order.status] ?? {
    label: order.status,
    classe: "bg-platre-fonce text-encre-doux",
  };

  // Factures visibles selon le rôle : l'acheteur voit sa facture d'achat,
  // le producteur sa facture de vente. La facture de commission est le
  // document de la plateforme — elle n'est affichée à aucun des deux.
  const facturesVisibles = order.invoices.filter((facture) =>
    estAcheteur ? facture.type === "ACHETEUR" : facture.type === "VENTE",
  );

  // Montant net pour le producteur (total - commission)
  const netCents = order.totalCents - order.commissionCents;

  return (
    <div>
      <Link
        href="/tableau-de-bord/commandes"
        className="etiquette text-encre-doux transition-colors hover:text-garance"
      >
        ← Retour aux commandes
      </Link>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-affiche text-3xl text-encre uppercase">
            Commande
          </h1>
          <span
            className={`rounded-sm px-3 py-1.5 text-xs font-bold tracking-wider uppercase ${statut.classe}`}
          >
            {statut.label}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-encre-doux">
          <span>
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {estProducteurConcerne && (
            <span>
              Acheteur :{" "}
              <span className="font-medium text-encre">
                {order.buyer.displayName}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Articles */}
      <div className="mt-6 space-y-3">
        <h2 className="font-affiche text-lg text-encre uppercase">Articles</h2>

        {order.items.map((item) => (
          <div
            key={item.id}
            className="relief-doux border-2 border-encre bg-[#fbf7ec] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link
                  href={`/annonces/${item.listing.id}`}
                  className="font-texte text-sm font-bold text-encre transition-colors hover:text-garance"
                >
                  {item.listing.title}
                </Link>
                <p className="text-xs text-encre-doux">
                  {item.listing.producer.displayName} —{" "}
                  {item.listing.producer.city} (
                  {nomDepartement(item.listing.producer.departement ?? "")})
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-encre-doux">
                  {item.quantity}{" "}
                  {UNITES[item.listing.unit] ?? item.listing.unit}(s) ×{" "}
                  {formaterPrix(item.unitPriceCents)}
                </p>
                <p className="font-bold text-encre">
                  {formaterPrix(item.subtotalCents)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé financier */}
      <div className="relief-doux mt-6 border-2 border-encre bg-[#fbf7ec] p-6">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-encre-doux">Total</dt>
            <dd className="prix-peint text-2xl text-garance">
              {formaterPrix(order.totalCents)}
            </dd>
          </div>

          {estProducteurConcerne && (
            <>
              <div className="flex justify-between border-t-2 border-encre/10 pt-2">
                <dt className="text-encre-doux">Commission plateforme</dt>
                <dd className="text-encre-doux">
                  −{formaterPrix(order.commissionCents)}
                </dd>
              </div>
              <div className="flex justify-between border-t-2 border-encre/10 pt-2">
                <dt className="font-bold text-encre">Reversé sur votre compte</dt>
                <dd className="font-bold text-verdigris">
                  {formaterPrix(netCents)}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {/* Factures */}
      {order.status === "PAID" && (
        <div className="mt-6 space-y-3">
          <h2 className="font-affiche text-lg text-encre uppercase">Factures</h2>
          {facturesVisibles.length === 0 ? (
            <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-4 text-sm text-encre-doux">
              Les factures de cette commande sont en cours de génération.
              Retrouvez-les dans l&apos;onglet «&nbsp;Mes factures&nbsp;».
            </div>
          ) : (
            facturesVisibles.map((facture) => (
              <div
                key={facture.id}
                className="relief-doux flex items-center justify-between border-2 border-encre bg-[#fbf7ec] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-sm px-2.5 py-1 text-xs font-bold tracking-wider uppercase ${BADGES_TYPES_FACTURES[facture.type]}`}
                  >
                    {LIBELLES_COURTS_FACTURES[facture.type]}
                  </span>
                  <p className="font-texte text-sm font-bold text-encre">
                    {facture.numero}
                  </p>
                </div>
                {facture.storagePath ? (
                  <Link
                    href={`/api/factures/${facture.id}/telecharger`}
                    className="text-xs font-bold tracking-wide text-outremer underline transition-colors hover:text-garance"
                  >
                    Télécharger le PDF
                  </Link>
                ) : (
                  <span className="text-xs text-encre-doux italic">
                    PDF en cours de génération
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
