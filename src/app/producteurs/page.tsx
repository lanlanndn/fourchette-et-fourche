import type { Metadata } from "next";
import Link from "next/link";
import { listerProducteurs } from "@/lib/donnees";
import { nomDepartement } from "@/lib/geo-metadata";

export const metadata: Metadata = { title: "Producteurs" };

export default async function ProducteursPage() {
  const producteurs = await listerProducteurs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-brun">
        L&apos;annuaire des producteurs
      </h1>
      <p className="mt-1 text-sm text-brun-clair">
        {producteurs.length} producteur{producteurs.length > 1 ? "s" : ""}{" "}
        partout en France
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {producteurs.map((prod) => (
          <Link
            key={prod.id}
            href={`/producteurs/${prod.id}`}
            className="rounded-2xl border border-creme-fonce bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-foret-pale text-2xl">
                🚜
              </div>
              <div>
                <h2 className="font-titre text-lg font-bold text-brun">
                  {prod.displayName}
                </h2>
                <p className="text-sm text-brun-clair">
                  📍 {prod.city} — {nomDepartement(prod.departement ?? "")}
                </p>
              </div>
            </div>

            {prod.bio && (
              <p className="mt-3 line-clamp-2 text-sm text-brun-clair">
                {prod.bio}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {prod.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="rounded-full bg-foret-pale px-2 py-0.5 text-[10px] font-semibold text-foret"
                  >
                    {cert === "BIO" ? "🌿 Bio" : cert.replace("_", " ")}
                  </span>
                ))}
              </div>
              <span className="text-xs font-semibold text-terre">
                {prod.listings.length} annonce
                {prod.listings.length > 1 ? "s" : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
