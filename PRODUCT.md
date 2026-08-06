# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Producteurs / agriculteurs locaux (prioritaires à convaincre)** : souvent peu à l'aise avec le numérique, ils veulent vendre leurs produits aux restaurateurs de leur région sans intermédiaire. Le site doit d'abord les rassurer et les persuader de publier leurs annonces.
- **Restaurateurs (secondaires)** : cherchent des produits frais, traçables, en circuit court ; ils parcourent les annonces par région/département et contactent les producteurs.

Interface 100 % en français, vouvoiement, ton chaleureux.

## Product Purpose

Marketplace B2B française, « le Leboncoin de l'appro local » : mettre en relation directe restaurateurs et producteurs locaux. Un restaurateur clique sa région/département sur une carte interactive, voit les annonces du coin, contacte le producteur, commande et paie en ligne. La plateforme prend une commission (10 % par défaut, paramétrable). Succès = des producteurs qui publient et des restaurateurs qui commandent.

## Positioning

La mise en relation directe par la géographie : la carte interactive région → département est le mécanisme central — on ne cherche pas un produit dans un catalogue national, on découvre qui produit quoi *autour de chez soi*. Pas d'intermédiaire qui gonfle les prix : les deux parties fixent leurs conditions ensemble.

## Operating Context

- Usage web desktop et mobile ; les producteurs consultent probablement depuis un téléphone ou une tablette à la ferme, les restaurateurs entre deux services.
- Le site tourne actuellement en **mode démo** (8 producteurs fictifs, 16 annonces d'exemple) en attendant le branchement Supabase ; le bandeau « Mode démo » reste affiché tant que la vraie base n'est pas branchée.

## Capabilities and Constraints

- Annonces avec catégories, prix au centime, unités, certifications (bio etc.), fiches détaillées.
- Carte Leaflet cliquable (13 régions, 96 départements métropole) pilotant les filtres d'URL.
- Comptes avec rôles restaurateur/producteur (code écrit, non testé — attend Supabase).
- Paiement Stripe Connect, messagerie, emails : phases futures, pas encore installés.
- Stack figée sauf raison majeure : Next.js 15 + React 19 + TypeScript strict, Tailwind CSS v4 (thème dans `globals.css`), Supabase, Prisma 6.
- Propriétaire non-codeur : tout ce qui demande une action humaine se guide pas à pas.

## Brand Commitments

- **Nom** : « Fourchette & Fourche » (la fourchette du restaurateur, la fourche du producteur).
- **Voix** : française, chaleureuse, vouvoiement des utilisateurs pro.
- **Aucun logo ni asset de marque n'existe** — le 🍴 actuel tient lieu de placeholder. Le propriétaire est **ouvert à un changement visuel radical** (palette, polices, style réinterprétables librement).

## Evidence on Hand

- Données de démo fictives uniquement (`src/lib/donnees/demo.ts`) — 8 producteurs, 16 annonces.
- **Aucune photo réelle, aucun logo, aucun témoignage client** : ne jamais en fabriquer. Les visuels doivent reposer sur la typographie, la couleur, la forme et le code (SVG dessinés à la main), pas sur des images stock ou générées.

## Product Principles

1. **Le producteur d'abord** : chaque écran doit rassurer un agriculteur pressé et peu technophile — simplicité radicale, zéro jargon, bénéfice concret immédiat (« publiez en 2 minutes »).
2. **La géographie est le produit** : la carte et l'ancrage local priment sur tout effet de catalogue.
3. **Direct et humain** : on sent des personnes et des fermes derrière chaque annonce, jamais une plateforme froide.
4. **Confiance artisanale** : le sérieux d'un outil pro avec la chaleur d'un marché de village — ni corporate, ni gadget.
