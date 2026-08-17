import { STATUTS_LIVRAISON } from "@/lib/constantes";

type Props = {
  deliveryStatus: keyof typeof STATUTS_LIVRAISON;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  adresse?: string | null; // adresse de livraison (rappel pour l'acheteur)
};

export default function BlocSuivi({
  deliveryStatus,
  carrier,
  trackingNumber,
  trackingUrl,
  shippedAt,
  deliveredAt,
  adresse,
}: Props) {
  const statut = STATUTS_LIVRAISON[deliveryStatus] ?? {
    label: deliveryStatus,
    classe: "bg-platre-fonce text-encre-doux",
  };

  return (
    <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-affiche text-lg text-encre uppercase">Livraison</h2>
        <span
          className={`rounded-sm px-2.5 py-1 text-xs font-bold tracking-wider uppercase ${statut.classe}`}
        >
          {statut.label}
        </span>
      </div>

      {deliveryStatus === "NOT_SHIPPED" ? (
        <p className="mt-3 text-sm text-encre-doux">
          Cette commande n&apos;a pas encore été expédiée.
        </p>
      ) : (
        <dl className="mt-4 space-y-2 text-sm">
          {adresse && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-encre-doux">Livraison à</dt>
              <dd className="text-right font-medium text-encre">{adresse}</dd>
            </div>
          )}
          {carrier && (
            <div className="flex justify-between">
              <dt className="text-encre-doux">Transporteur</dt>
              <dd className="font-medium text-encre">{carrier}</dd>
            </div>
          )}
          {trackingNumber && (
            <div className="flex justify-between">
              <dt className="text-encre-doux">Numéro de suivi</dt>
              <dd className="font-medium text-encre">{trackingNumber}</dd>
            </div>
          )}
          {trackingUrl && (
            <div className="flex justify-between">
              <dt className="text-encre-doux">Suivi en ligne</dt>
              <dd>
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-outremer underline transition-colors hover:text-garance"
                >
                  Suivre le colis
                </a>
              </dd>
            </div>
          )}
          {shippedAt && (
            <div className="flex justify-between border-t-2 border-encre/10 pt-2">
              <dt className="text-encre-doux">Expédiée le</dt>
              <dd className="text-encre">
                {new Date(shippedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          )}
          {deliveredAt && (
            <div className="flex justify-between border-t-2 border-encre/10 pt-2">
              <dt className="text-encre-doux">Livrée le</dt>
              <dd className="text-encre">
                {new Date(deliveredAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
