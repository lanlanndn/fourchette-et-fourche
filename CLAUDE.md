# CLAUDE.md — Fourchette & Fourche 🍴

> **À lire en premier par toute IA qui reprend ce projet.**
> Ce fichier contient tout le contexte nécessaire pour continuer sans poser de questions déjà tranchées.

---

## 1. Le projet en 30 secondes

**Fourchette & Fourche** est une marketplace B2B française, « le Leboncoin de l'appro local » : elle met en relation des **restaurateurs** avec des **producteurs/agriculteurs locaux**. Un restaurateur clique sa région/département sur une carte interactive, voit les annonces du coin, contacte le producteur, commande et paie en ligne. La plateforme prend une commission (paramétrable, 10 % par défaut).

- **Propriétaire** : Landry — **NON-CODEUR, francophone**. Voir §2.
- **Zone** : France entière (le lancement commercial sera conseillé sur une région pilote).
- **Plan complet approuvé** : `/home/landry/.claude/plans/jazzy-baking-noodle.md`
- **Guide pour Landry** : `GUIDE.md` (à la racine du projet)
- **Produit & design** : `PRODUCT.md` (vérité produit : audiences, positionnement, assets) et `DESIGN.md` (système visuel « Enseigne peinte ») — à respecter pour toute nouvelle page.

---

## 2. Règles d'or avec Landry (humain non-technique)

1. **Toujours répondre en français**, sans jargon. Expliquer simplement.
2. Landry **n'écrit aucun code**. Ses seules actions : créer des comptes en ligne et copier-coller des clés — **toujours le guider pas à pas, écran par écran**.
3. L'**interface du site est 100 % en français** (vouvoiement des utilisateurs pro, ton chaleureux).
4. Ne jamais lui demander de choisir entre des technologies : choisir pour lui, expliquer en une phrase.
5. Il aime être conseillé et qu'on lui pose des questions produit (il l'a demandé explicitement).
6. **Audience prioritaire : les producteurs** (décision de Landry, 6 août 2026) — chaque écran persuade d'abord le producteur, rassure ensuite le restaurateur. **Anti-but design nommé : le rustique kitsch** (vichy, botte de paille, ferme en carton-pâte).

---

## 3. Stack technique (ne pas changer sans raison majeure)

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript strict + React 19 | Standard, IA-friendly |
| Style | Tailwind CSS **v4** (thème dans `src/app/globals.css` via `@theme`) | Monde « Enseigne peinte » : palette `platre`, `outremer`, `garance`, `ocre`, `encre` — **voir `DESIGN.md`** (redesign 6 août 2026) |
| BDD + Auth + Storage | **Supabase** (PostgreSQL + Auth + Storage photos) | Gratuit, tout-en-un |
| ORM | Prisma 6 (`prisma/schema.prisma`) | Migrations simples |
| Paiement | Stripe Connect (destination charges, `application_fee_amount`) | Phase 5 — pas encore installé |
| Carte | Leaflet + react-leaflet 5 + OpenStreetMap | Gratuit, sans clé API |
| Géocodage | api-adresse.data.gouv.fr + geo.api.gouv.fr | Gratuit, officiel |
| Emails | Resend | Phase 4 — pas encore installé |
| Hébergement (futur) | Vercel (site) + Supabase cloud (données) | ~0 €/mois |

**Commandes** : `npm run dev` (dév), `npm run build` (doit toujours passer avant de livrer), `npx tsc --noEmit` (types), `npx prisma migrate dev` (migrations, nécessite `DATABASE_URL`).

---

## 4. État d'avancement (au 7 août 2026)

### ✅ Terminé et vérifié (build OK, pages testées 200)
- **Phase 0 — Fondations** : projet complet, page d'accueil, header/footer, pages légales (gabarits), git initialisé.
- **Phase 1 — Comptes (CODE ÉCRIT, NON TESTÉ EN CONDITIONS RÉELLES)** : inscription (choix rôle producteur/restaurateur, producteur en premier), connexion, mot de passe oublié, tableau de bord protégé, profil avec géocodage d'adresse. **En attente d'une instance Supabase pour être testé.**
- **Mode démo (choix de Landry)** : 8 producteurs + 16 annonces d'exemple (`src/lib/donnees/demo.ts`), page `/annonces` avec **carte interactive cliquable** (région → département → annonces filtrées), filtres (catégorie/département/recherche), fiches `/annonces/[id]`, annuaire `/producteurs` + `/producteurs/[id]`, carte + section « Fraîchement arrivées » sur l'accueil, bandeau « Mode démo » (plaque ocre).
- **Redesign « Enseigne peinte » (6 août 2026, skill impeccable)** : tout le site refait dans le monde visuel choisi par Landry (murs publicitaires peints 1900-1970) — mur de plâtre, capitales Caprasimo ombrées, encres outremer/garance/ocre, plaques départementales jaunes, étiquettes d'étal, médaillon fourchette×fourche dessiné (`MarqueFF.tsx`). Relecture de finition : verdict **ship**. Zéro photo (aucun asset réel) : la typographie et les plaques portent tout. Système documenté dans `DESIGN.md`, contrat de direction en commentaire HTML dans `src/app/layout.tsx` (seed d5e83781, vérifié présent dans le build).

### ⏳ À faire (dans l'ordre prévu)
- **Phase 2** : branchement Supabase (voir §6) → test Phase 1 → création/édition d'annonces avec upload photos (Supabase Storage) depuis le tableau de bord. **Note design** : quand les photos arrivent, elles remplacent la plaque couleur des cartes d'annonces (slot prévu, voir `DESIGN.md`).
- **Phase 3** : finaliser la carte avec vraies données + filtre par rayon (haversine).
- **Phase 4** : messagerie (tables déjà dans le schéma) + notifications email Resend.
- **Phase 5** : commandes + Stripe Connect (mode test, clés `sk_test`), onboarding producteur, webhook `/api/webhooks/stripe`, remboursements. Prérequis humain : statut auto-entrepreneur de Landry + compte Stripe.
- **Phase 6** : finitions (emails transactionnels, SEO, responsive, guide final).

### Dépôts / comptes
- Git **local** initialisé (branche `main`, 3 commits). **Pas encore de GitHub distant ni de Vercel** — à créer avec Landry quand il voudra mettre en ligne.
- **Aucun compte externe créé** pour l'instant (ni Supabase, ni Stripe, ni Resend).

---

## 5. Architecture clé (à respecter)

### Bascule démo ↔ production — LE point central
`src/lib/donnees/index.ts` expose `listerAnnonces()`, `getAnnonce()`, `listerProducteurs()`, `getProducteur()`, `estModeDemo()`. La constante `MODE_DEMO = !process.env.DATABASE_URL` choisit la source : **fausses données** (`demo.ts`) ou **Prisma**. Les pages ne doivent JAMAIS importer Prisma ou demo.ts directement — toujours passer par cette couche. Toute nouvelle donnée s'ajoute dans les DEUX branches (démo + Prisma).

### Auth (Supabase Auth + profil Prisma)
- L'`id` du profil Prisma `User` = l'UUID du user Supabase Auth (créé dans `inscriptionAction`, `src/lib/actions/auth.ts`).
- `src/lib/auth.ts` : `getCurrentUser()`, `requireUser()`, `requireRole()`.
- Middleware `src/middleware.ts` : rafraîchit la session ; **si Supabase n'est pas configuré, le site tourne en mode vitrine sans erreur** (`estSupabaseConfigure()` dans `src/lib/supabase/config.ts`) — NE PAS casser ce comportement.

### Conventions de données
- **Argent toujours en centimes** (`priceCents`, `totalCents`…). Affichage via `formaterPrix()` de `src/lib/constantes.ts`.
- Catégories/unités/certifications : libellés FR dans `src/lib/constantes.ts` — ainsi que `COULEURS_CATEGORIES` (encre peinte + couleur de texte par catégorie, utilisée par les cartes, fiches et plaques).
- Codes département (`"44"`) et région (`"52"`) stockés en string ; helpers dans `src/lib/geo-metadata.ts` (`nomDepartement()`, `nomRegion()`…).
- Dates : Prisma `DateTime`.

### Carte (`src/components/carte/`)
- `CarteAnnonces.tsx` = wrapper `next/dynamic` **ssr:false** (Leaflet exige le navigateur) ; la logique est dans `CarteAnnoncesInner.tsx`.
- Contours : `public/geojson/regions.geojson` (13 régions) et `departements.geojson` (96 dép., métropole seulement) — source : github.com/gregoiredavid/france-geojson (version simplifiée). ⚠️ `geo.api.gouv.fr?format=geojson` ne renvoie PAS les géométries, seulement les métadonnées (conservées dans `regions.json` / `departements.json` pour les listes).
- La sélection pilote l'URL (`?region=…&departement=…`) via `router.push` ; la page serveur refiltre.
- Marqueurs : `L.divIcon` avec l'emoji de la catégorie dans une **étiquette d'étal** crème (classe `.etiquette-etal` de `globals.css`) — c'est la SEULE place où les emojis sont admis (pictogrammes fonctionnels).
- **Le conteneur de la carte exige une hauteur définie** (`h-[420px] lg:h-[560px]`) : jamais `h-full` vers un parent sans hauteur (voir §7).

### Styles — monde « Enseigne peinte » (voir `DESIGN.md`, la référence)
- Palette du thème (`bg-platre`, `text-garance`, `bg-outremer`, `text-encre`…) définie dans `src/app/globals.css`. Polices : Caprasimo (`--font-affiche`, capitales peintes) + Chivo (`--font-texte`) via `next/font/google`.
- **Utilitaires maison** (`@utility` dans `globals.css`) : `relief` / `relief-doux` (ombres franches décalées), `cadre`, `filet` / `filet-blanc` (filets doubles intérieurs), `etiquette` (petites capitales espacées), `libelle` (labels de formulaire), `champ` + `champ-focus` (inputs), `prix-peint` (prix en Caprasimo tabulaire), `ombre-lettre*` (ombres de lettres peintes). Classes simples : `grain` / `grain-mur` (texture plâtre), `coins` / `coins-clairs` (équerres d'enseigne), `frise-defile` (frise de plaques), `peint-entree` (entrée animée unique du héros).
- **Composants du monde** : `MarqueFF.tsx` (médaillon logo fourchette×fourche), `PlaqueDepartement.tsx` (panneau D jaune), `icones.tsx` (pictogrammes SVG dessinés : épingle, échange, bouclier, fourchette, fourche).
- **Règles dures** : angles presque carrés (2-4 px), bordures encre 2 px, pas de dégradés ni de flou « verre », **jamais de kicker/sur-titre au-dessus d'un titre** (le titre porte seul), **jamais d'emoji décoratif** (icônes = `icones.tsx`), grandes capitales Caprasimo avec `ombre-lettre`. Contrat de direction : commentaire HTML en tête de `<body>` dans `src/app/layout.tsx` (seed d5e83781) — ne pas le retirer.

---

## 6. Branchement Supabase (prochaine action avec Landry)

Deux options (Landry choisira ; Docker est installé et fonctionne sur sa machine) :
- **Local (Docker)** : `npx supabase start` → récupérer URL + clés via `npx supabase status` → DATABASE_URL = `postgresql://postgres:postgres@localhost:54322/postgres`.
- **Cloud** : supabase.com → nouveau projet → Project Settings > API (URL, anon, service_role) et Database > Connection string URI.

Ensuite :
1. Copier `.env.local.example` → `.env.local`, remplir les 4 valeurs Supabase + DATABASE_URL.
2. `npx prisma migrate dev --name init` (crée les tables).
3. Vérifier : inscription → connexion → profil avec adresse (géocodage automatique).
4. Le bandeau démo disparaît automatiquement dès que `DATABASE_URL` existe.

`.env.local` n'est JAMAIS commité (déjà dans `.gitignore`).

---

## 7. Pièges déjà rencontrés (ne pas re-chercher)

- **npm 12** bloque les scripts postinstall par défaut → warnings `install-scripts` normaux et sans impact (Prisma/sharp fonctionnent ; si sharp pose problème un jour : `npm install-scripts approve sharp`).
- **Prisma** : les commentaires de schéma sont `//` (pas `#`).
- **`searchParams`/`params` sont des Promises** en Next 15 : toujours `await searchParams`.
- **`next/dynamic` avec `ssr: false` est interdit dans un Server Component** → passer par un wrapper client (pattern déjà utilisé pour la carte).
- **Supabase SSR** : typer explicitement les cookies (`CookieOptions` de `@supabase/ssr`) sinon erreurs TS en strict.
- Commits faits avec `git -c user.name="Landry" -c user.email="landry@fourchette-fourche.local"` (pas de config git globale sur la machine).
- **Ne JAMAIS lancer `npm run build` pendant que `npm run dev` tourne** : les deux partagent `.next` → le site casse dans le navigateur (« Cannot find module './XXX.js' »). Réparation : arrêter le dev, `rm -rf .next`, relancer le dev.
- **Carte Leaflet invisible** si sa hauteur vient de `h-full`/`min-h` vers un parent sans hauteur définie (le % ne se résout pas → 0 px). Le conteneur porte sa propre hauteur fixe (`h-[420px] lg:h-[560px]`) ; pour l'intégrer dans un cadre (accueil), forcer avec `[&>div]:!h-full`.
- **Navigateur par défaut de la machine sous VPN** : les URL locales (`localhost`, `127.0.0.1`) ne s'y ouvrent pas (`xdg-open` inutile). Utiliser **`chromium`** directement — aussi pour les captures d'écran : `chromium --headless --no-sandbox --hide-scrollbars --virtual-time-budget=20000 --window-size=1440,900 --screenshot=out.png URL`.
- **Tailwind v4** : les classes maison se définissent avec `@utility` dans `globals.css` (pas `@layer` seul si on veut les variantes `hover:`/`focus:`).

---

## 8. Checklist avant de dire « c'est terminé » à Landry

1. `npx tsc --noEmit` passe.
2. `npm run build` passe (**dev arrêté pendant le build**, voir §7) ; si le contrat de direction a bougé, grep du seed dans `.next/server/app/index.html`.
3. `npm run dev` + curl des pages touchées → 200 attendus.
4. Si du visuel a changé : capture `chromium --headless` (desktop + mobile) et relecture visuelle ; le rendu respecte `DESIGN.md` (pas de kicker, pas d'emoji décoratif, angles carrés, relief).
5. Commits en français, concis.
6. Réponse à Landry : en français, simple, avec ce qu'il peut tester et comment.

---

*Dernière mise à jour : 7 août 2026 — consolidation complète après le redesign « Enseigne peinte ».*
