import Link from "next/link";

const categories = [
  { emoji: "🥕", label: "Légumes" },
  { emoji: "🍎", label: "Fruits" },
  { emoji: "🥩", label: "Viande" },
  { emoji: "🐔", label: "Volaille" },
  { emoji: "🐟", label: "Poisson" },
  { emoji: "🧀", label: "Fromage" },
  { emoji: "🥛", label: "Produits laitiers" },
  { emoji: "🍷", label: "Vin & boissons" },
  { emoji: "🍯", label: "Miel" },
  { emoji: "🥚", label: "Œufs" },
  { emoji: "🌾", label: "Farine & céréales" },
  { emoji: "🫒", label: "Huile" },
];

export default function Home() {
  return (
    <div>
      {/* ===== Héros ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-foret-pale to-creme">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <p className="mb-4 inline-block rounded-full bg-foret-pale px-4 py-1.5 text-sm font-semibold text-foret">
            🇫🇷 La marketplace des circuits courts
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-brun md:text-6xl">
            Du champ à l&apos;assiette,{" "}
            <span className="text-foret">en direct</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-brun-clair">
            Fourchette &amp; Fourche met en relation les restaurateurs avec les
            producteurs de leur région. Des produits frais, traçables, et des
            producteurs mieux payés.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/annonces"
              className="w-full rounded-full bg-foret px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-foret-clair sm:w-auto"
            >
              🗺️ Voir les annonces près de chez moi
            </Link>
            <Link
              href="/inscription"
              className="w-full rounded-full border-2 border-terre bg-white px-8 py-3.5 text-base font-semibold text-terre transition-colors hover:bg-terre-pale sm:w-auto"
            >
              Je suis producteur
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Comment ça marche ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h2 className="text-center text-3xl font-bold text-brun md:text-4xl">
          Comment ça marche ?
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Restaurateurs */}
          <div className="rounded-2xl border border-terre-pale bg-terre-pale/40 p-8">
            <p className="text-3xl">🍽️</p>
            <h3 className="mt-3 text-xl font-bold text-terre-fonce">
              Pour les restaurateurs
            </h3>
            <ol className="mt-5 space-y-4">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terre text-sm font-bold text-white">
                  1
                </span>
                <p className="text-sm text-brun">
                  <strong>Cliquez sur votre région</strong> sur la carte et
                  découvrez les producteurs autour de vous.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terre text-sm font-bold text-white">
                  2
                </span>
                <p className="text-sm text-brun">
                  <strong>Échangez directement</strong> avec le producteur via
                  la messagerie : disponibilités, prix, livraison.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-terre text-sm font-bold text-white">
                  3
                </span>
                <p className="text-sm text-brun">
                  <strong>Commandez et payez en ligne</strong>, en toute
                  sécurité. Et mettez le local en avant sur votre carte !
                </p>
              </li>
            </ol>
            <Link
              href="/inscription"
              className="mt-6 inline-block rounded-full bg-terre px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-terre-fonce"
            >
              Créer mon compte restaurateur
            </Link>
          </div>

          {/* Producteurs */}
          <div className="rounded-2xl border border-foret-pale bg-foret-pale/40 p-8">
            <p className="text-3xl">🚜</p>
            <h3 className="mt-3 text-xl font-bold text-foret">
              Pour les producteurs
            </h3>
            <ol className="mt-5 space-y-4">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foret text-sm font-bold text-white">
                  1
                </span>
                <p className="text-sm text-brun">
                  <strong>Publiez vos annonces en 2 minutes</strong> : produit,
                  prix, quantité, photo. Comme sur un bon vieux boncoin.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foret text-sm font-bold text-white">
                  2
                </span>
                <p className="text-sm text-brun">
                  <strong>Recevez des demandes</strong> de restaurateurs de
                  votre région, directement dans votre messagerie.
                </p>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foret text-sm font-bold text-white">
                  3
                </span>
                <p className="text-sm text-brun">
                  <strong>Soyez payé directement</strong>, sans intermédiaire
                  qui gonfle les prix. Vos produits, vos prix.
                </p>
              </li>
            </ol>
            <Link
              href="/inscription"
              className="mt-6 inline-block rounded-full bg-foret px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-foret-clair"
            >
              Créer mon compte producteur
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Catégories ===== */}
      <section className="bg-creme-fonce/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-brun">
            Tout ce dont votre cuisine a besoin
          </h2>
          <p className="mt-3 text-center text-brun-clair">
            Des produits frais, de saison, et des producteurs passionnés.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href="/annonces"
                className="flex flex-col items-center gap-2 rounded-xl border border-creme-fonce bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-foret-clair hover:shadow-md"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-brun">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pourquoi ===== */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h2 className="text-center text-3xl font-bold text-brun">
          Pourquoi Fourchette &amp; Fourche ?
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-4xl">📍</p>
            <h3 className="mt-3 font-titre text-lg font-bold">
              100% local
            </h3>
            <p className="mt-2 text-sm text-brun-clair">
              La carte interactive vous montre uniquement les producteurs de
              votre région et de votre département.
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl">🤝</p>
            <h3 className="mt-3 font-titre text-lg font-bold">
              En direct, sans intermédiaire
            </h3>
            <p className="mt-2 text-sm text-brun-clair">
              Restaurateurs et producteurs discutent et fixent leurs conditions
              ensemble. La plateforme ne s&apos;interpose jamais.
            </p>
          </div>
          <div className="text-center">
            <p className="text-4xl">🔒</p>
            <h3 className="mt-3 font-titre text-lg font-bold">
              Paiement sécurisé
            </h3>
            <p className="mt-2 text-sm text-brun-clair">
              Le paiement en ligne protège les deux parties : le producteur est
              sûr d&apos;être payé, le restaurateur d&apos;être livré.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="bg-foret py-16 text-center text-white md:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-3xl font-bold md:text-4xl">
            Prêt à passer au circuit court ?
          </h2>
          <p className="mt-4 text-foret-pale">
            Rejoignez les restaurateurs et producteurs qui construisent
            l&apos;alimentation locale de demain.
          </p>
          <Link
            href="/inscription"
            className="mt-8 inline-block rounded-full bg-terre px-10 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-terre-fonce"
          >
            Créer mon compte gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
}
