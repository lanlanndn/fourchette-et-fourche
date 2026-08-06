import type { Metadata } from "next";
import FormulaireReinitialisation from "@/components/forms/FormulaireReinitialisation";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="font-affiche text-4xl leading-tight text-encre uppercase">
          Nouveau mot de passe
        </h1>
        <p className="mt-3 text-sm text-encre-doux">
          Et cette fois, notez-le quelque part.
        </p>
      </div>

      <div className="relief mt-8 border-2 border-encre bg-[#fbf7ec] p-6 md:p-8">
        <FormulaireReinitialisation />
      </div>
    </div>
  );
}
