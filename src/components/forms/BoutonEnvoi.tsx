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
      className="relief w-full rounded-sm border-2 border-encre bg-garance px-6 py-3.5 font-texte text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {enCours ? texteEnCours : texte}
    </button>
  );
}
