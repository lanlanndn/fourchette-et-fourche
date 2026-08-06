// Petit bandeau affiché en bas de page tant que le site
// tourne avec les données de démonstration.
export default function BandeauDemo() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[2000] border-t border-terre-pale bg-white/95 px-4 py-2 text-center shadow-lg backdrop-blur">
      <p className="text-xs text-brun">
        🎭 <strong>Mode démo</strong> — les annonces et producteurs sont des
        exemples. Les comptes, la messagerie et le paiement seront activés à
        la prochaine étape.
      </p>
    </div>
  );
}
