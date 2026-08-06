import type { Metadata } from "next";
import Link from "next/link";
import FormulaireInscription from "@/components/forms/FormulaireInscription";

export const metadata: Metadata = { title: "Inscription" };

export default function InscriptionPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="font-affiche text-4xl leading-tight text-encre uppercase">
          Rejoignez le marché
        </h1>
        <p className="mt-3 text-sm text-encre-doux">
          Gratuit, sans engagement. Votre compte en 2 minutes.
        </p>
      </div>

      <div className="relief mt-8 border-2 border-encre bg-[#fbf7ec] p-6 md:p-8">
        <FormulaireInscription />
      </div>

      <p className="mt-6 text-center text-sm text-encre-doux">
        Déjà un compte ?{" "}
        <Link
          href="/connexion"
          className="font-bold text-outremer underline decoration-2 underline-offset-2 hover:text-garance"
        >
          Connectez-vous
        </Link>
      </p>
    </div>
  );
}
