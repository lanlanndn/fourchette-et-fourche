import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import FormulaireProfil from "@/components/forms/FormulaireProfil";

export const metadata: Metadata = { title: "Mon profil" };

export default async function ProfilPage() {
  const user = await requireUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brun">Mon profil</h1>
      <p className="mt-1 text-sm text-brun-clair">
        Ces informations sont visibles par les autres professionnels.
      </p>

      <div className="mt-6 rounded-2xl border border-creme-fonce bg-white p-6 md:p-8">
        <FormulaireProfil user={user} />
      </div>
    </div>
  );
}
