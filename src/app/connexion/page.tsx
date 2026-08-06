import type { Metadata } from "next";
import Link from "next/link";
import FormulaireConnexion from "@/components/forms/FormulaireConnexion";

export const metadata: Metadata = { title: "Connexion" };

export default function ConnexionPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brun">Bon retour ! 👋</h1>
        <p className="mt-2 text-sm text-brun-clair">
          Connecte-toi à ton compte Fourchette &amp; Fourche.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-creme-fonce bg-white p-6 shadow-sm md:p-8">
        <FormulaireConnexion />
      </div>

      <p className="mt-6 text-center text-sm text-brun-clair">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-foret underline">
          Inscris-toi gratuitement
        </Link>
      </p>
    </div>
  );
}
