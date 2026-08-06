// Médaillon de marque : la fourchette du restaurateur et la fourche du
// producteur, croisées comme sur une plaque émaillée de bistrot.
// Dessiné à la main — c'est le seul « logo » du projet.
export default function MarqueFF({
  className = "h-9 w-9",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="Fourchette & Fourche"
    >
      {/* Pastille émaillée */}
      <circle cx="24" cy="24" r="22" fill="#1e3f8c" stroke="#28221b" strokeWidth="2" />
      <circle cx="24" cy="24" r="18.5" fill="none" stroke="#f1eada" strokeWidth="1.4" opacity="0.85" />

      {/* La fourche (3 dents), penchée à gauche */}
      <g
        stroke="#f1eada"
        strokeWidth="2.3"
        strokeLinecap="round"
        transform="rotate(-26 24 24)"
      >
        <line x1="24" y1="20" x2="24" y2="39" />
        <line x1="19.5" y1="11" x2="19.5" y2="19" />
        <line x1="24" y1="10" x2="24" y2="19" />
        <line x1="28.5" y1="11" x2="28.5" y2="19" />
        <path d="M19.5 19 Q24 22 28.5 19" fill="none" />
      </g>

      {/* La fourchette (4 dents), penchée à droite */}
      <g
        stroke="#f1eada"
        strokeWidth="2.3"
        strokeLinecap="round"
        transform="rotate(26 24 24)"
      >
        <line x1="24" y1="21" x2="24" y2="39" />
        <line x1="20.2" y1="12.5" x2="20.2" y2="19.5" />
        <line x1="22.7" y1="12" x2="22.7" y2="19.5" />
        <line x1="25.3" y1="12" x2="25.3" y2="19.5" />
        <line x1="27.8" y1="12.5" x2="27.8" y2="19.5" />
        <path d="M20.2 19.5 Q24 22.5 27.8 19.5" fill="none" />
      </g>
    </svg>
  );
}
