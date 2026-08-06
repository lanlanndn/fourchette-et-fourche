// Bandeau affiché en bas de page tant que le site tourne avec les données
// de démonstration. Une plaque de chantier ocre, comme sur un mur en travaux.
export default function BandeauDemo() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[2000] border-t-2 border-encre bg-ocre px-4 py-2 text-center shadow-[0_-3px_0_rgb(40_34_27/0.3)]">
      <p className="text-xs font-semibold text-encre">
        <span className="etiquette mr-2 rounded-sm border-2 border-encre bg-platre px-1.5 py-px">
          Mode démo
        </span>
        Les annonces et producteurs sont des exemples — les comptes, la
        messagerie et le paiement seront activés à la prochaine étape.
      </p>
    </div>
  );
}
