import type { EtatFormulaire } from "@/lib/actions/auth";

// Affiche le message d'erreur ou de succès d'un formulaire
export default function MessageFormulaire({ etat }: { etat: EtatFormulaire }) {
  if (!etat) return null;

  if (etat.erreur) {
    return (
      <p className="rounded-sm border-2 border-garance bg-garance/10 px-4 py-3 text-sm font-medium text-garance-fonce">
        {etat.erreur}
      </p>
    );
  }
  if (etat.succes) {
    return (
      <p className="rounded-sm border-2 border-verdigris bg-verdigris/10 px-4 py-3 text-sm font-medium text-verdigris">
        {etat.succes}
      </p>
    );
  }
  return null;
}
