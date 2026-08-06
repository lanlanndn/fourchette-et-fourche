import type { Metadata } from "next";
import Link from "next/link";
import FormulaireInscription from "@/components/forms/FormulaireInscription";

export const metadata: Metadata = { title: "Inscription" };

export default function InscriptionPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brun">
          Rejoins Fourchette &amp; Fourche
        </h1>
        <p className="mt-2 text-sm text-brun-clair">
          Gratuit, sans engagement. Ton compte en 2 minutes.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-creme-fonce bg-white p-6 shadow-sm md:p-8">
        <FormulaireInscription />
      </div>

      <p className="mt-6 text-center text-sm text-brun-clair">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-semibold text-foret underline">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}
