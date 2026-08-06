// Plaque départementale : le petit panneau jaune des routes départementales.
// Sert partout où on parle d'un département (cartes, filtres, fiches).
export default function PlaqueDepartement({
  code,
  className = "",
}: {
  code: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-sm border-2 border-encre bg-ocre px-1.5 py-px align-middle font-texte text-[0.68rem] font-extrabold tracking-[0.08em] text-encre ${className}`}
    >
      D&nbsp;{code}
    </span>
  );
}
