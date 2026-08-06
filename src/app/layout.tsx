import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BandeauDemo from "@/components/BandeauDemo";
import { estModeDemo } from "@/lib/donnees";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Fourchette & Fourche — Du producteur au restaurateur",
    template: "%s | Fourchette & Fourche",
  },
  description:
    "La marketplace qui met en relation les restaurateurs avec les producteurs locaux. Trouvez des produits frais près de chez vous, directement à la ferme.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {estModeDemo() && <BandeauDemo />}
      </body>
    </html>
  );
}
