// Petites marques au pochoir, dessinées à la main pour le monde
// « enseigne peinte ». Elles remplacent les emojis décoratifs.
// Traits épais, bouts ronds : ce qui se lisait à 10 mètres sur un mur.

const traits = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function IconeEpingle({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traits}>
      <path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 1 1 13 0c0 4.6-6.5 10-6.5 10Z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </svg>
  );
}

export function IconeEchange({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traits}>
      <path d="M4 8.5h13m0 0-3.5-3.5M17 8.5l-3.5 3.5" />
      <path d="M20 15.5H7m0 0 3.5-3.5M7 15.5l3.5 3.5" />
    </svg>
  );
}

export function IconeBouclier({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traits}>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.3 7 8.8 4.1-1.5 7-4.5 7-8.8V5.8L12 3Z" />
      <path d="m8.8 11.6 2.3 2.3 4.1-4.3" />
    </svg>
  );
}

export function IconeFourchette({
  className = "h-6 w-6",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traits}>
      <path d="M12 11v10" />
      <path d="M8.5 3v5M10.8 3v5M13.2 3v5M15.5 3v5" />
      <path d="M8.5 8q3.5 2.6 7 0" />
    </svg>
  );
}

export function IconeFourche({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traits}>
      <path d="M12 11v10" />
      <path d="M8 2.5V8M12 2v6M16 2.5V8" />
      <path d="M8 8q4 3 8 0" />
    </svg>
  );
}

export function IconeCamion({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traits}>
      <rect x="2" y="7" width="12" height="9" rx="1.5" />
      <path d="M14 11h3l3 3v2h-6z" />
      <circle cx="6.5" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
      <path d="M10 11V7" />
    </svg>
  );
}

export function IconeColis({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traits}>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <path d="M12 5v14" />
      <path d="M9 9h6" />
    </svg>
  );
}

export function IconeCheckRond({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...traits}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.3 2.3 4.7-4.6" />
    </svg>
  );
}
