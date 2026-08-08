import type { Metadata } from "next";
import Link from "next/link";
import { listerAnnonces } from "@/lib/donnees";
import { CATEGORIES, COULEURS_CATEGORIES } from "@/lib/constantes";
import CarteAnnonce from "@/components/CarteAnnonce";
import CarteAnnonces from "@/components/carte/CarteAnnonces";
import PlaqueDepartement from "@/components/PlaqueDepartement";
import {
  IconeEpingle,
  IconeEchange,
  IconeBouclier,
  IconeFourche,
  IconeFourchette,
} from "@/components/icones";

export const metadata: Metadata = {
  title: "Fourchette & Fourche — Du producteur au restaurateur",
  description:
    "La marketplace qui met en relation les restaurateurs avec les producteurs locaux. Trouvez des produits frais près de chez vous, directement à la ferme, dans toute la France.",
  keywords: ["producteurs locaux", "restaurateurs", "circuit court", "produits frais", "agriculture", "marketplace"],
  openGraph: {
    title: "Fourchette & Fourche — Du producteur au restaurateur",
    description:
      "La marketplace qui met en relation les restaurateurs avec les producteurs locaux. Produits frais, directement à la ferme.",
    type: "website",
    locale: "fr_FR",
  },
};

// Une poignée de départements pour la frise du héros
const FRISE_DEPTS = [
  "44", "69", "13", "33", "59", "31", "35", "67", "06", "29",
  "38", "64", "84", "21", "25", "73", "11", "63", "72", "14",
];

const categories = Object.entries(CATEGORIES);

export default async function Home() {
  const annonces = await listerAnnonces();
  const dernieresAnnonces = annonces.slice(0, 6);
  const [vedette1, vedette2] = annonces;

  return (
    <div>
      {/* ===== Le mur (héros) ===== */}
      <section className="grain grain-mur coins relative overflow-hidden border-b-2 border-encre bg-platre">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-14 md:pt-24 md:pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Le texte peint */}
            <div className="lg:col-span-7">
              <h1 className="font-affiche text-[2.9rem] leading-[0.95] tracking-tight text-encre uppercase md:text-7xl">
                <span className="peint-entree ombre-lettre block" style={{ animationDelay: "0.08s" }}>
                  Vos produits.
                </span>
                <span className="peint-entree ombre-lettre-garance block text-garance" style={{ animationDelay: "0.2s" }}>
                  Leurs cartes.
                </span>
              </h1>
              <p className="peint-entree mt-6 max-w-xl text-lg leading-relaxed text-encre-doux" style={{ animationDelay: "0.32s" }}>
                Fourchette &amp; Fourche met vos annonces sous les yeux des
                restaurateurs de votre région. Vous fixez vos prix, vous
                échangez en direct, et la plateforme ne prend que 10&nbsp;% de
                commission — jamais d&apos;abonnement.
              </p>
              <div className="peint-entree mt-9 flex flex-col gap-4 sm:flex-row sm:items-center" style={{ animationDelay: "0.44s" }}>
                <Link
                  href="/inscription"
                  className="relief inline-block rounded-sm border-2 border-encre bg-garance px-8 py-4 text-center font-texte text-base font-bold tracking-wide text-platre uppercase transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-garance-fonce hover:shadow-[6px_6px_0_0_rgb(40_34_27/0.9)]"
                >
                  Publier ma première annonce
                </Link>
                <Link
                  href="/annonces"
                  className="inline-block rounded-sm border-2 border-encre bg-platre px-8 py-4 text-center font-texte text-base font-bold tracking-wide text-encre uppercase transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-platre-fonce hover:shadow-[6px_6px_0_0_rgb(40_34_27/0.35)]"
                >
                  Voir les annonces
                </Link>
              </div>
              <p className="peint-entree etiquette mt-6 text-encre-doux" style={{ animationDelay: "0.56s" }}>
                Inscription gratuite — 2 minutes, montre en main
              </p>
            </div>

            {/* Deux étiquettes épinglées au mur */}
            <div className="relative hidden lg:col-span-5 lg:block">
              <div className="rotate-[1.5deg] peint-entree" style={{ animationDelay: "0.3s" }}>
                {vedette1 && <CarteAnnonce annonce={vedette1} />}
              </div>
              <div className="-mt-6 ml-10 -rotate-2 peint-entree" style={{ animationDelay: "0.45s" }}>
                {vedette2 && <CarteAnnonce annonce={vedette2} />}
              </div>
            </div>
          </div>
        </div>

        {/* Frise de plaques départementales */}
        <div className="border-t-2 border-encre bg-platre-fonce/70 py-3 overflow-hidden">
          <div className="frise-defile flex w-max items-center gap-3 pr-3">
            {[...FRISE_DEPTS, ...FRISE_DEPTS].map((code, i) => (
              <PlaqueDepartement key={`${code}-${i}`} code={code} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== La bande des engagements ===== */}
      <section className="grain grain-mur border-b-2 border-encre bg-garance">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-platre">
          {["Inscription gratuite", "Commission : 10 %", "Vous fixez vos prix", "Paiement sécurisé"].map(
            (texte, i) => (
              <p key={texte} className="etiquette flex items-center gap-6 !text-[0.78rem] text-platre">
                {i > 0 && <span aria-hidden className="text-ocre">✚</span>}
                {texte}
              </p>
            ),
          )}
        </div>
      </section>

      {/* ===== La carte — la géographie est le produit ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-affiche text-4xl leading-tight text-encre uppercase md:text-5xl">
              Cliquez votre département.
            </h2>
            <p className="mt-5 leading-relaxed text-encre-doux">
              Pas de catalogue national noyé sous les annonces : une région,
              puis un département, et vous voyez <strong className="text-encre">qui produit
              quoi autour de vous</strong>. C&apos;est tout.
            </p>
            <ol className="mt-6 space-y-3">
              {[
                "Cliquez une région sur la carte",
                "Puis votre département",
                "Les annonces du coin s'affichent",
              ].map((etape, i) => (
                <li key={etape} className="flex items-baseline gap-3">
                  <span className="prix-peint shrink-0 text-xl text-garance">
                    {i + 1}.
                  </span>
                  <span className="text-sm font-medium text-encre">{etape}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-7">
            <div className="relief h-[380px] border-2 border-encre md:h-[460px] [&>div]:!h-full">
              <CarteAnnonces annonces={annonces} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Fraîchement arrivées ===== */}
      <section className="border-y-2 border-encre bg-platre-fonce/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-affiche text-4xl text-encre uppercase">
                Fraîchement arrivées
              </h2>
              <p className="mt-2 text-encre-doux">
                Les dernières annonces publiées par les producteurs.
              </p>
            </div>
            <Link
              href="/annonces"
              className="hidden shrink-0 rounded-sm border-2 border-encre bg-platre px-5 py-2.5 font-texte text-sm font-bold tracking-wide text-encre uppercase transition-all hover:-translate-y-0.5 hover:bg-platre-fonce hover:shadow-[4px_4px_0_0_rgb(40_34_27/0.35)] sm:block"
            >
              Tout voir →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dernieresAnnonces.map((annonce) => (
              <CarteAnnonce key={annonce.id} annonce={annonce} />
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link
              href="/annonces"
              className="inline-block rounded-sm border-2 border-encre bg-platre px-5 py-2.5 text-sm font-bold tracking-wide uppercase"
            >
              Tout voir →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Comment ça marche — le producteur d'abord ===== */}
      <section className="grain grain-mur coins-clairs filet-blanc relative border-b-2 border-encre bg-outremer text-platre">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="text-center font-affiche text-4xl tracking-wide uppercase md:text-5xl">
            Comment ça marche&nbsp;?
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {/* Producteurs — en premier */}
            <div className="relief border-2 border-encre bg-platre p-8 text-encre">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-sm border-2 border-encre bg-ocre text-encre">
                  <IconeFourche className="h-6 w-6" />
                </span>
                <h3 className="font-affiche text-2xl tracking-wide text-encre uppercase">
                  Pour les producteurs
                </h3>
              </div>
              <ol className="mt-7 space-y-5">
                {[
                  <>Publiez votre annonce en 2 minutes : produit, prix, quantité. Comme sur un bon vieux boncoin.</>,
                  <>Recevez des demandes de restaurateurs de votre région, directement dans votre messagerie.</>,
                  <>Soyez payé directement, sans intermédiaire qui gonfle les prix. Vos produits, vos prix.</>,
                ].map((texte, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="prix-peint shrink-0 text-3xl leading-none text-garance">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{texte}</p>
                  </li>
                ))}
              </ol>
              <Link
                href="/inscription"
                className="mt-8 inline-block rounded-sm border-2 border-encre bg-garance px-6 py-3 font-texte text-sm font-bold tracking-wide text-platre uppercase transition-colors hover:bg-garance-fonce"
              >
                Créer mon compte producteur
              </Link>
            </div>

            {/* Restaurateurs */}
            <div className="relief border-2 border-encre bg-platre p-8 text-encre">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-sm border-2 border-encre bg-platre-fonce text-encre">
                  <IconeFourchette className="h-6 w-6" />
                </span>
                <h3 className="font-affiche text-2xl tracking-wide text-encre uppercase">
                  Pour les restaurateurs
                </h3>
              </div>
              <ol className="mt-7 space-y-5">
                {[
                  <>Cliquez votre région sur la carte et découvrez les producteurs autour de vous.</>,
                  <>Échangez directement avec le producteur : disponibilités, prix, livraison.</>,
                  <>Commandez et payez en ligne, en toute sécurité. Et mettez le local en avant sur votre carte !</>,
                ].map((texte, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="prix-peint shrink-0 text-3xl leading-none text-outremer">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{texte}</p>
                  </li>
                ))}
              </ol>
              <Link
                href="/inscription"
                className="mt-8 inline-block rounded-sm border-2 border-encre bg-outremer px-6 py-3 font-texte text-sm font-bold tracking-wide text-platre uppercase transition-colors hover:bg-outremer-nuit"
              >
                Créer mon compte restaurateur
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Les familles de produits ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-center font-affiche text-4xl text-encre uppercase">
          Toutes les familles de produits
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {categories.map(([code, cat]) => {
            const encre_cat = COULEURS_CATEGORIES[code] ?? {
              fond: "#6b5f4e",
              texte: "#f1eada",
            };
            return (
              <Link
                key={code}
                href={`/annonces?categorie=${code}`}
                className="rounded-sm border-2 border-encre px-4 py-2.5 font-texte text-sm font-bold tracking-wide uppercase transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgb(40_34_27/0.9)]"
                style={{ backgroundColor: encre_cat.fond, color: encre_cat.texte }}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== Pourquoi — un triptyque peint, pas trois cartes ===== */}
      <section className="border-t-2 border-encre bg-platre-fonce/50">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="text-center font-affiche text-4xl text-encre uppercase">
            Pourquoi Fourchette &amp; Fourche&nbsp;?
          </h2>
          <div className="relief-doux coins mt-14 grid divide-y-2 divide-encre/15 border-2 border-encre bg-platre sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0">
            {[
              {
                icone: <IconeEpingle className="h-9 w-9" />,
                titre: "100 % local",
                texte: "La carte vous montre uniquement les producteurs de votre région et de votre département.",
              },
              {
                icone: <IconeEchange className="h-9 w-9" />,
                titre: "En direct",
                texte: "Restaurateurs et producteurs fixent leurs conditions ensemble. La plateforme ne s'interpose jamais.",
              },
              {
                icone: <IconeBouclier className="h-9 w-9" />,
                titre: "Paiement sécurisé",
                texte: "Le producteur est sûr d'être payé, le restaurateur d'être livré. Les deux parties sont protégées.",
              },
            ].map((arg) => (
              <div key={arg.titre} className="px-8 py-10 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-sm border-2 border-encre bg-ocre/25 text-garance shadow-[3px_3px_0_0_rgb(40_34_27/0.35)]">
                  {arg.icone}
                </span>
                <h3 className="mt-5 font-affiche text-2xl tracking-wide uppercase">
                  {arg.titre}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-encre-doux">
                  {arg.texte}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="grain grain-mur coins-clairs filet-blanc relative border-t-2 border-encre bg-outremer-nuit text-center text-platre">
        <div className="mx-auto max-w-3xl px-4 py-20 md:py-24">
          <h2 className="font-affiche text-4xl leading-tight tracking-wide uppercase md:text-5xl">
            Prêt à passer au{" "}
            <span className="text-ocre">circuit court</span>&nbsp;?
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-platre/75">
            Rejoignez les restaurateurs et producteurs qui construisent
            l&apos;alimentation locale de demain.
          </p>
          <Link
            href="/inscription"
            className="mt-9 inline-block rounded-sm border-2 border-platre bg-garance px-10 py-4 font-texte text-lg font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce hover:shadow-[6px_6px_0_0_rgb(241_234_218/0.35)]"
          >
            Créer mon compte gratuitement
          </Link>
          <p className="etiquette mt-6 text-platre/75">
            Gratuit — sans engagement
          </p>
        </div>
      </section>
    </div>
  );
}
