import Link from "next/link";
import type { AnnonceAvecProducteur } from "@/lib/donnees/types";
import { CATEGORIES, UNITES, formaterPrix } from "@/lib/constantes";

// Carte d'aperçu d'une annonce (utilisée dans les listes)
export default function CarteAnnonce({
  annonce,
}: {
  annonce: AnnonceAvecProducteur;
}) {
  const cat = CATEGORIES[annonce.category] ?? CATEGORIES.AUTRE;

  return (
    <Link
      href={`/annonces/${annonce.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-creme-fonce bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Visuel (emoji en attendant les photos) */}
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-foret-pale to-creme-fonce text-6xl transition-transform group-hover:scale-105">
        {cat.emoji}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-titre text-base font-bold leading-snug text-brun">
            {annonce.title}
          </h3>
        </div>

        <p className="mt-1 text-xs text-brun-clair">
          {annonce.producer.displayName} · {annonce.city} ({annonce.departement})
        </p>

        {annonce.certifications.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {annonce.certifications.map((cert) => (
              <span
                key={cert}
                className="rounded-full bg-foret-pale px-2 py-0.5 text-[10px] font-semibold text-foret"
              >
                {cert === "BIO" ? "🌿 Bio" : cert.replace("_", " ")}
              </span>
            ))}
          </div>
        )}

        <p className="mt-auto pt-3 text-lg font-bold text-foret">
          {formaterPrix(annonce.priceCents)}
          <span className="text-xs font-normal text-brun-clair">
            {" "}
            / {UNITES[annonce.unit] ?? annonce.unit}
          </span>
        </p>
      </div>
    </Link>
  );
}
