type Props = {
  emoji: string;
  titre: string;
  children: React.ReactNode;
};

export default function PageEnConstruction({ emoji, titre, children }: Props) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl">{emoji}</p>
      <h1 className="mt-6 text-3xl font-bold text-brun">{titre}</h1>
      <div className="mt-4 text-brun-clair">{children}</div>
      <p className="mt-8 rounded-full bg-foret-pale px-5 py-2 text-sm font-semibold text-foret">
        🚧 Cette section est en cours de construction — elle arrive très vite !
      </p>
    </div>
  );
}
