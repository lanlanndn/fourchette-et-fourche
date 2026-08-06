import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import FormulaireProfil from "@/components/forms/FormulaireProfil";

export const metadata: Metadata = { title: "Mon profil" };

export default async function ProfilPage() {
  const user = await requireUser();

  return (
    <div>
      <h1 className="font-affiche text-3xl text-encre uppercase">Mon profil</h1>
      <p className="mt-1 text-sm text-encre-doux">
        Ces informations sont visibles par les autres professionnels.
      </p>

      <div className="relief-doux mt-6 border-2 border-encre bg-[#fbf7ec] p-6 md:p-8">
        <FormulaireProfil user={user} />
      </div>
    </div>
  );
}
