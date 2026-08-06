import Link from "next/link";
import type { AnnonceAvecProducteur } from "@/lib/donnees/types";
import {
  CATEGORIES,
  COULEURS_CATEGORIES,
  UNITES,
  formaterPrix,
} from "@/lib/constantes";
import PlaqueDepartement from "@/components/PlaqueDepartement";

// Carte d'aperçu d'une annonce : une étiquette d'étal peinte.
// La plaque de couleur porte le nom de la catégorie en capitales —
// pas de photo pour l'instant, la typographie fait le travail.
export default function CarteAnnonce({
  annonce,
}: {
  annonce: AnnonceAvecProducteur;
}) {
  const cat = CATEGORIES[annonce.category] ?? CATEGORIES.AUTRE;
  const encre_cat = COULEURS_CATEGORIES[annonce.category] ?? {
    fond: "#6b5f4e",
    texte: "#f1eada",
  };

  return (
    <Link
      href={`/annonces/${annonce.id}`}
      className="group flex flex-col border-2 border-encre bg-[#fbf7ec] relief-doux transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_rgb(40_34_27/0.9)]"
    >
      {/* Plaque catégorie — le mot peint en capitales */}
      <div
        className="grain grain-mur relative flex h-24 items-center justify-between px-4"
        style={{ backgroundColor: encre_cat.fond, color: encre_cat.texte }}
      >
        <span className="ombre-lettre-plaque font-affiche text-2xl leading-none tracking-wide uppercase">
          {cat.label}
        </span>
        <PlaqueDepartement code={annonce.departement} />
      </div>

      <div className="flex flex-1 flex-col border-t-2 border-encre p-4">
        <h3 className="font-affiche text-lg leading-snug text-encre">
          {annonce.title}
        </h3>

        <p className="mt-1 text-xs font-medium text-encre-doux">
          {annonce.producer.displayName} · {annonce.city}
        </p>

        {annonce.certifications.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {annonce.certifications.map((cert) => (
              <span
                key={cert}
                className="-rotate-1 rounded-xs border border-verdigris px-1.5 py-px text-[10px] font-bold tracking-wider text-verdigris uppercase"
              >
                {cert === "BIO" ? "Bio" : cert.replace("_", " ")}
              </span>
            ))}
          </div>
        )}

        <p className="prix-peint mt-auto pt-3 text-2xl text-garance">
          {formaterPrix(annonce.priceCents)}
          <span className="font-texte text-xs font-medium tracking-normal text-encre-doux">
            {" "}
            / {UNITES[annonce.unit] ?? annonce.unit}
          </span>
        </p>
      </div>
    </Link>
  );
}
