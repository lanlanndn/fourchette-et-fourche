import type { Metadata } from "next";
import Link from "next/link";
import FormulaireMotDePasseOublie from "@/components/forms/FormulaireMotDePasseOublie";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function MotDePasseOubliePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="font-affiche text-4xl leading-tight text-encre uppercase">
          Mot de passe oublié&nbsp;?
        </h1>
        <p className="mt-3 text-sm text-encre-doux">
          Pas de panique. Indiquez votre email et nous vous envoyons un lien
          pour choisir un nouveau mot de passe.
        </p>
      </div>

      <div className="relief mt-8 border-2 border-encre bg-[#fbf7ec] p-6 md:p-8">
        <FormulaireMotDePasseOublie />
      </div>

      <p className="mt-6 text-center text-sm text-encre-doux">
        <Link
          href="/connexion"
          className="font-bold text-outremer underline decoration-2 underline-offset-2 hover:text-garance"
        >
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
