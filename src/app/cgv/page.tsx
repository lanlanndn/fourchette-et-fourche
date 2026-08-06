import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conditions Générales de Vente" };

export default function CgvPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-affiche text-4xl text-encre uppercase">
        Conditions Générales de Vente
      </h1>
      <div className="relief-doux mt-8 space-y-4 border-2 border-encre bg-ocre/15 p-6 text-sm leading-relaxed text-encre">
        <p className="font-bold">
          Gabarit temporaire — à compléter avant d&apos;activer les paiements.
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
