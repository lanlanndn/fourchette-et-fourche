import type { Metadata } from "next";
import Link from "next/link";
import FormulaireConnexion from "@/components/forms/FormulaireConnexion";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Fourchette & Fourche pour gérer vos annonces, votre messagerie et vos commandes.",
};

export default function ConnexionPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="font-affiche text-4xl leading-tight text-encre uppercase">
          Bon retour
        </h1>
        <p className="mt-3 text-sm text-encre-doux">
          Connectez-vous à votre compte Fourchette &amp; Fourche.
        </p>
      </div>

      <div className="relief mt-8 border-2 border-encre bg-[#fbf7ec] p-6 md:p-8">
        <FormulaireConnexion />
      </div>

      <p className="mt-6 text-center text-sm text-encre-doux">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="font-bold text-outremer underline decoration-2 underline-offset-2 hover:text-garance"
        >
          Inscrivez-vous gratuitement
        </Link>
      </p>
    </div>
  );
}
