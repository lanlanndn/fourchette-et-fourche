import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions Générales de Vente" };

export default function CgvPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-brun">
        Conditions Générales de Vente
      </h1>
      <div className="mt-6 space-y-4 rounded-xl border border-terre-pale bg-terre-pale/30 p-6 text-sm text-brun">
        <p className="font-semibold">
          ⚠️ Gabarit temporaire — à compléter avant d&apos;activer les
          paiements.
        </p>
        <p>
          Les CGV devront préciser : le rôle d&apos;intermédiaire de la
          plateforme, la commission prélevée, les conditions de commande, de
          livraison, de rétractation et de remboursement, et la responsabilité
          des vendeurs (producteurs) quant à la qualité et la conformité des
          produits alimentaires.
        </p>
        <p>
          Claude peut générer un gabarit à faire valider par un professionnel
          du droit.
        </p>
      </div>
    </div>
  );
}
