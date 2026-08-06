import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function TableauDeBordPage() {
  const user = await requireUser();
  const estProducteur = user.role === "PRODUCTEUR";
  const profilIncomplet = !user.lat || !user.city;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brun">
          Bonjour {user.displayName} 👋
        </h1>
        <p className="mt-1 text-sm text-brun-clair">
          {estProducteur
            ? "Bienvenue sur ton espace producteur."
            : "Bienvenue sur ton espace restaurateur."}
        </p>
      </div>

      {profilIncomplet && (
        <div className="rounded-xl border border-terre-pale bg-terre-pale/40 p-5">
          <p className="font-semibold text-terre-fonce">
            📍 Dernière étape : ton adresse
          </p>
          <p className="mt-1 text-sm text-brun">
            {estProducteur
              ? "Indique l'adresse de ton exploitation pour que les restaurateurs de ta région te trouvent sur la carte."
              : "Indique l'adresse de ton restaurant pour voir les producteurs autour de toi."}
          </p>
          <Link
            href="/tableau-de-bord/profil"
            className="mt-3 inline-block rounded-full bg-terre px-5 py-2 text-sm font-semibold text-white hover:bg-terre-fonce"
          >
            Compléter mon profil
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {estProducteur ? (
          <>
            <div className="rounded-xl border border-creme-fonce bg-white p-6">
              <p className="text-3xl">🥕</p>
              <h2 className="mt-2 font-titre text-lg font-bold">Mes annonces</h2>
              <p className="mt-1 text-sm text-brun-clair">
                Publie tes produits avec photos et prix. (Arrive à la phase 2 !)
              </p>
            </div>
            <div className="rounded-xl border border-creme-fonce bg-white p-6">
              <p className="text-3xl">💶</p>
              <h2 className="mt-2 font-titre text-lg font-bold">
                Recevoir mes paiements
              </h2>
              <p className="mt-1 text-sm text-brun-clair">
                Active les paiements pour être payé directement. (Phase 5 !)
              </p>
            </div>
          </>
        ) : (
          <>
            <Link
              href="/annonces"
              className="rounded-xl border border-creme-fonce bg-white p-6 transition-shadow hover:shadow-md"
            >
              <p className="text-3xl">🗺️</p>
              <h2 className="mt-2 font-titre text-lg font-bold">
                Explorer les annonces
              </h2>
              <p className="mt-1 text-sm text-brun-clair">
                Découvre les producteurs de ta région sur la carte.
              </p>
            </Link>
            <div className="rounded-xl border border-creme-fonce bg-white p-6">
              <p className="text-3xl">📦</p>
              <h2 className="mt-2 font-titre text-lg font-bold">
                Mes commandes
              </h2>
              <p className="mt-1 text-sm text-brun-clair">
                Suis tes commandes en cours. (Phase 5 !)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
