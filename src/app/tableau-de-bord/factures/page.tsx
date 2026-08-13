import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formaterPrix } from "@/lib/constantes";
import {
  BADGES_TYPES_FACTURES,
  LIBELLES_COURTS_FACTURES,
} from "@/lib/facturation/constantes";

export const metadata: Metadata = { title: "Mes factures" };

export default async function FacturesPage() {
  const user = await requireUser();
  const estProducteur = user.role === "PRODUCTEUR";

  const factures = await prisma.invoice.findMany({
    where: estProducteur
      ? { emitPourUserId: user.id }
      : { order: { buyerId: user.id } },
    include: {
      order: { select: { createdAt: true, totalCents: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-affiche text-3xl text-encre uppercase">Mes factures</h1>
      <p className="mt-1 text-sm text-encre-doux">
        {estProducteur
          ? "Vos factures de vente et de commission sont générées automatiquement à chaque commande payée, au format Factur-X."
          : "Vos factures d'achat sont générées automatiquement à chaque commande payée, au format Factur-X."}
      </p>

      {factures.length === 0 ? (
        <div className="relief-doux mt-6 border-2 border-encre bg-[#fbf7ec] p-8 text-center">
          <p className="text-sm text-encre-doux">
            Aucune facture pour le moment. Vos factures apparaîtront ici dès
            qu&apos;une commande sera payée.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {factures.map((facture) => (
            <div
              key={facture.id}
              className="relief-doux flex items-center justify-between border-2 border-encre bg-[#fbf7ec] p-5"
            >
              <div className="min-w-0">
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
                <p className="mt-1 text-xs text-encre-doux">
                  {new Date(facture.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  — Commande du{" "}
                  {new Date(facture.order.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span className="prix-peint text-xl text-garance">
                  {formaterPrix(facture.montantTtcCents)}
                </span>
                {facture.storagePath ? (
                  <Link
                    href={`/api/factures/${facture.id}/telecharger`}
                    className="rounded-sm border-2 border-encre px-3 py-1.5 text-xs font-bold tracking-wide text-outremer uppercase transition-colors hover:bg-outremer hover:text-platre"
                  >
                    Télécharger
                  </Link>
                ) : (
                  <span className="text-xs text-encre-doux italic">
                    PDF en cours de génération
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
