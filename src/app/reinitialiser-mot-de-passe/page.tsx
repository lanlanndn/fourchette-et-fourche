import type { Metadata } from "next";
import FormulaireReinitialisation from "@/components/forms/FormulaireReinitialisation";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brun">
          Choisis un nouveau mot de passe
        </h1>
        <p className="mt-2 text-sm text-brun-clair">
          Et cette fois, note-le quelque part. 😉
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-creme-fonce bg-white p-6 shadow-sm md:p-8">
        <FormulaireReinitialisation />
      </div>
    </div>
  );
}
