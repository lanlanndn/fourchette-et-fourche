---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/annonces/page.tsx","src/app/producteurs/page.tsx","src/app/inscription/page.tsx"]
---

# Brief de surface — Page d'accueil (`/`)

## Mode et audience
Mode **Persuade**. Audience prioritaire : le producteur (peu technophile, pressé, méfiant envers les plateformes) ; secondaire : le restaurateur. Le visiteur doit comprendre en 5 secondes : ici je vends aux restaurants du coin, je fixe mes prix, 10 % de commission, pas d'abonnement.

## Action et preuve
Action principale : « Publier ma première annonce » (→ /inscription). Secondaire : « Voir les annonces » (→ /annonces). Preuve disponible : les vraies données de démo (annonces affichées telles quelles, étiquetées par le bandeau Mode démo) et la carte interactive elle-même, démontrée dans le 2e écran. Aucun témoignage ni chiffre inventé — ne jamais en ajouter sans matière réelle.

## Direction choisie
« L'Enseigne Peinte » (seed d5e83781, choix de Landry sur la page de décision) : mur de plâtre, capitales Caprasimo avec ombre peinte, plaques départementales ocres, étiquettes d'étal, médaillon émaillé fourchette×fourche. Anti-but nommé par Landry : le rustique kitsch — la patine reste typographique, jamais décorative.

## Moment mémorable
Le premier écran : capitales géantes « VOS PRODUITS. LEURS CARTES. » ombrées au pinceau, deux étiquettes d'annonces épinglées, la frise défilante de plaques D en bas du mur.

## Contraintes et décisions en suspens
- Zéro photo tant que le mode démo dure ; les cartes-étiquettes acceptent plus tard un slot photo (phase 2, Supabase Storage) — la plaque catégorie devient alors bandeau d'image.
- Emojis conservés uniquement comme pictogrammes de catégories dans les étiquettes de la carte Leaflet (fonctionnels, encadrés) ; partout ailleurs : icônes SVG dessinées (`src/components/icones.tsx`).
- Vouvoiement généralisé (corrigé lors du redesign, les pages auth tutoyaient).
