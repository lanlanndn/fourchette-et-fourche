import type { EtatFormulaire } from "@/lib/actions/auth";

// Affiche le message d'erreur ou de succès d'un formulaire
export default function MessageFormulaire({ etat }: { etat: EtatFormulaire }) {
  if (!etat) return null;

  if (etat.erreur) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        ⚠️ {etat.erreur}
      </p>
    );
  }
  if (etat.succes) {
    return (
      <p className="rounded-lg border border-foret-pale bg-foret-pale/50 px-4 py-3 text-sm text-foret">
        {etat.succes}
      </p>
    );
  }
  return null;
}
