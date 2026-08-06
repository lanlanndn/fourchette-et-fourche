type Props = {
  titre: string;
  children: React.ReactNode;
};

// Page d'attente pour les sections pas encore ouvertes :
// une plaque de chantier accrochée au mur.
export default function PageEnConstruction({ titre, children }: Props) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="relief -rotate-2 rounded-sm border-2 border-encre bg-ocre px-5 py-2.5 font-texte text-sm font-extrabold tracking-[0.2em] text-encre uppercase">
        En chantier
      </p>
      <h1 className="mt-8 font-affiche text-4xl leading-tight text-encre uppercase">
        {titre}
      </h1>
      <div className="mt-4 leading-relaxed text-encre-doux">{children}</div>
      <p className="etiquette mt-10 border-t-2 border-encre/15 pt-5 text-encre-doux">
        Cette section arrive très vite
      </p>
    </div>
  );
}
