import type { Metadata } from "next";
import { Caprasimo, Chivo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BandeauDemo from "@/components/BandeauDemo";
import { estModeDemo } from "@/lib/donnees";

const caprasimo = Caprasimo({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-caprasimo",
});
const chivo = Chivo({ subsets: ["latin"], variable: "--font-chivo" });

export const metadata: Metadata = {
  title: {
    default: "Fourchette & Fourche — Du producteur au restaurateur",
    template: "%s | Fourchette & Fourche",
  },
  description:
    "La marketplace qui met en relation les restaurateurs avec les producteurs locaux. Trouvez des produits frais près de chez vous, directement à la ferme.",
};

// Contrat de direction (seed d5e83781) — émis en commentaire HTML, 1er enfant du body.
const CONTRAT = `<!--
DIRECTION CONTRACT — FOURCHETTE & FOURCHE — seed d5e83781
THESIS : un mur peint par un artisan lettreur français (1900-1970) ; la typographie monumentale porte tout, aucune photo, les prix sont des chiffres peints. Refuse le héro centré à dégradé, les cartes arrondies et les emojis décoratifs de la catégorie.
OWN-WORLD : plâtre #F1EADA, outremer #1E3F8C, garance #B93A1D, ocre #DDA92C, encre #28221B ; Caprasimo pour les capitales peintes, Chivo pour le texte ; plaques départementales ocres, filets doubles, ombres-relief franches, angles presque carrés.
STORY : un producteur comprend en cinq secondes — ici je vends aux restaurants du coin, je fixe mes prix, 10 % de commission, pas d'abonnement — et il publie.
FIRST VIEWPORT : mur de plâtre, médaillon émaillé, capitales géantes à gauche, deux étiquettes d'annonces épinglées à droite, CTA garance, frise de plaques départementales en bas.
FORM : enseigne peinte rurale, candidate 3/7 de la liste fondée, seed d5e83781.
FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
-->`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${caprasimo.variable} ${chivo.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <div hidden aria-hidden dangerouslySetInnerHTML={{ __html: CONTRAT }} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {estModeDemo() && <BandeauDemo />}
      </body>
    </html>
  );
}
