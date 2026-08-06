"use client";

// Bouton d'envoi de formulaire avec état de chargement
export default function BoutonEnvoi({
  enCours,
  texte,
  texteEnCours = "Un instant…",
}: {
  enCours: boolean;
  texte: string;
  texteEnCours?: string;
}) {
  return (
    <button
      type="submit"
      disabled={enCours}
      className="w-full rounded-full bg-terre px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-terre-fonce disabled:cursor-not-allowed disabled:opacity-60"
    >
      {enCours ? texteEnCours : texte}
    </button>
  );
}
