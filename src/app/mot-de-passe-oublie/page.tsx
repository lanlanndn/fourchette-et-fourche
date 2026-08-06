import type { Metadata } from "next";
import Link from "next/link";
import FormulaireMotDePasseOublie from "@/components/forms/FormulaireMotDePasseOublie";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function MotDePasseOubliePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brun">Mot de passe oublié ?</h1>
        <p className="mt-2 text-sm text-brun-clair">
          Pas de panique ! Indique ton email et on t&apos;envoie un lien pour
          choisir un nouveau mot de passe.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-creme-fonce bg-white p-6 shadow-sm md:p-8">
        <FormulaireMotDePasseOublie />
      </div>

      <p className="mt-6 text-center text-sm text-brun-clair">
        <Link href="/connexion" className="font-semibold text-foret underline">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
