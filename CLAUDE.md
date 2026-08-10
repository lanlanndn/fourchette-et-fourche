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
| Hébergement | **Vercel** (déployé) — domaine : `fourchette-et-fourche.vercel.app` | Gratuit |

**Commandes** : `npm run dev` (dév), `npm run build` (doit toujours passer avant de livrer), `npx tsc --noEmit` (types), `npx prisma migrate dev` (migrations, nécessite `DATABASE_URL`).

---

## 4. État d'avancement (au 10 août 2026)

### ✅ Terminé et vérifié (build OK, pages testées 200)
- **Phase 0 — Fondations** : projet complet, page d'accueil, header/footer, pages légales (gabarits), git initialisé.
- **Phase 1 — Comptes** : inscription (choix rôle producteur/restaurateur), connexion, mot de passe oublié, tableau de bord protégé, profil avec géocodage d'adresse. **Supabase Cloud configuré et testé.**
- **Phase 2 — Annonces** : création/édition d'annonces avec upload photos (Supabase Storage, drag & drop), liste des annonces dans le tableau de bord, activation/désactivation, bucket `annonces` avec RLS. Pages : `/tableau-de-bord/annonces`, `/tableau-de-bord/annonces/nouvelle`, `/tableau-de-bord/annonces/[id]/modifier`. Composants : `FormulaireAnnonce.tsx`, `UploadPhotos.tsx`.
- **Phase 3 — Carte** : bouton « Autour de moi » avec géolocalisation navigateur + fallback saisie ville, cercle de recherche sur la carte, sélecteur de rayon (5-100 km), filtre haversine (`src/lib/haversine.ts`), filtres responsives (repliables sur mobile), marqueur de centre de recherche. Filtres placés dans la colonne de droite à côté de la carte sur desktop.
- **Phase 4 — Messagerie** : conversations entre restaurateurs et producteurs, bouton « Contacter le producteur » sur les fiches annonces, badge de messages non lus dans le menu, pages `/tableau-de-bord/messagerie` et `/tableau-de-bord/messagerie/[id]`. Actions : `createOrGetConversationAction`, `sendMessageAction`, `markConversationAsRead`, `countUnreadMessages`.
- **Header intelligent** : le header affiche « Tableau de bord » + « Déconnexion » quand l'utilisateur est connecté, « Connexion » + « Publier une annonce » quand il ne l'est pas.
- **Mode démo (choix de Landry)** : 8 producteurs + 16 annonces d'exemple dans `src/lib/donnees/demo.ts`. Le mode démo s'active quand `DATABASE_URL` n'est pas configurée.
- **Redesign « Enseigne peinte » (6 août 2026, skill impeccable)** : monde visuel complet (voir `DESIGN.md`), contrat de direction dans `src/app/layout.tsx` (seed d5e83781).
- **Phase 6 — Finitions** : SEO (métadonnées enrichies, sitemap.xml, robots.txt), page 404 personnalisée.

### ⏳ À faire (quand Landry sera prêt)
- **Phase 5** : commandes + Stripe Connect (mode test, clés `sk_test`), onboarding producteur, webhook `/api/webhooks/stripe`. Prérequis : statut auto-entrepreneur + compte Stripe.
- **Resend** : emails transactionnels (notifications de nouveaux messages, confirmation de commande). Prérequis : compte Resend (gratuit, 100 emails/jour).
- **Domaine personnalisé** : acheter `fourchette-et-fourche.fr` et le configurer sur Vercel (~10 €/an).

### Dépôts / comptes créés
- **Supabase Cloud** : projet `tnwefomjxcbsallmcsvf` — base PostgreSQL, Auth, Storage (bucket `annonces`), RLS.
- **GitHub** : https://github.com/lanlanndn/fourchette-et-fourche (`main`)
- **Vercel** : déployé automatiquement depuis GitHub, URL publique `fourchette-et-fourche.vercel.app`
- **Stripe / Resend** : pas encore créés.

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
- `BoutonAutourDeMoi.tsx` = bouton de géolocalisation navigateur + fallback saisie ville avec autocomplétion (`suggererAdresses()` de `geo.ts`).
- `FiltresAnnonces.tsx` = barre de recherche, filtres catégorie/département, bouton « Autour de moi ». Repliable sur mobile (bouton « Filtres »).
- Contours : `public/geojson/regions.geojson` (13 régions) et `departements.geojson` (96 dép., métropole seulement) — source : github.com/gregoiredavid/france-geojson (version simplifiée). ⚠️ `geo.api.gouv.fr?format=geojson` ne renvoie PAS les géométries, seulement les métadonnées (conservées dans `regions.json` / `departements.json` pour les listes).
- La sélection pilote l'URL (`?region=…&departement=…&lat=…&lng=…&rayon=…`) via `router.push` ; la page serveur refiltre.
- Filtre par distance : fonction `distanceKm()` dans `src/lib/haversine.ts`, appliquée en post-filtrage dans `listerAnnonces()` (les deux branches : démo et Prisma).
- Marqueurs : `L.divIcon` avec l'emoji de la catégorie dans une **étiquette d'étal** crème (classe `.etiquette-etal` de `globals.css`) — c'est la SEULE place où les emojis sont admis (pictogrammes fonctionnels).
- **Le conteneur de la carte exige une hauteur définie** (`h-[420px] lg:h-[560px]`) : jamais `h-full` vers un parent sans hauteur (voir §7).

### Annonces (`src/lib/actions/annonces.ts`, `src/components/forms/`)
- `FormulaireAnnonce.tsx` = formulaire client partagé création/édition (titre, catégorie, prix, unité, quantité, certifications, adresse).
- `UploadPhotos.tsx` = upload direct navigateur → Supabase Storage (bucket `annonces`, dossier `{userId}/`), drag & drop, prévisualisation, 8 photos max.
- `BoutonContacter.tsx` = bouton « Contacter le producteur » sur les fiches annonces, ouvre un formulaire de premier message.

### Messagerie (`src/lib/actions/messagerie.ts`, `src/app/tableau-de-bord/messagerie/`)
- Actions : `createOrGetConversationAction` (crée ou retrouve une conversation + premier message), `sendMessageAction`, `markConversationAsRead`, `countUnreadMessages`.
- Badge de messages non lus dans le menu latéral du tableau de bord (pastille garance).

### Styles — monde « Enseigne peinte » (voir `DESIGN.md`, la référence)
- Palette du thème (`bg-platre`, `text-garance`, `bg-outremer`, `text-encre`…) définie dans `src/app/globals.css`. Polices : Caprasimo (`--font-affiche`, capitales peintes) + Chivo (`--font-texte`) via `next/font/google`.
- **Utilitaires maison** (`@utility` dans `globals.css`) : `relief` / `relief-doux` (ombres franches décalées), `cadre`, `filet` / `filet-blanc` (filets doubles intérieurs), `etiquette` (petites capitales espacées), `libelle` (labels de formulaire), `champ` + `champ-focus` (inputs), `prix-peint` (prix en Caprasimo tabulaire), `ombre-lettre*` (ombres de lettres peintes). Classes simples : `grain` / `grain-mur` (texture plâtre), `coins` / `coins-clairs` (équerres d'enseigne), `frise-defile` (frise de plaques), `peint-entree` (entrée animée unique du héros).
- **Composants du monde** : `MarqueFF.tsx` (médaillon logo fourchette×fourche), `PlaqueDepartement.tsx` (panneau D jaune), `icones.tsx` (pictogrammes SVG dessinés : épingle, échange, bouclier, fourchette, fourche).
- **Règles dures** : angles presque carrés (2-4 px), bordures encre 2 px, pas de dégradés ni de flou « verre », **jamais de kicker/sur-titre au-dessus d'un titre** (le titre porte seul), **jamais d'emoji décoratif** (icônes = `icones.tsx`), grandes capitales Caprasimo avec `ombre-lettre`. Contrat de direction : commentaire HTML en tête de `<body>` dans `src/app/layout.tsx` (seed d5e83781) — ne pas le retirer.

---

## 6. Configuration Supabase (FAIT — ne pas refaire)

### Ce qui a été configuré
- Projet Supabase Cloud : `tnwefomjxcbsallmcsvf`
- `.env.local` contient les 4 valeurs (URL, anon key, service_role, DATABASE_URL pooler).
- Migration Prisma exécutée (`prisma migrate dev --name init`).
- Bucket Storage `annonces` créé avec RLS (lecture publique, écriture par dossier `{userId}`).
- Auth : Site URL = `https://fourchette-et-fourche.vercel.app`, Redirect URLs incluent l'URL Vercel.

### Si Supabase doit être reconfiguré (nouveau projet)
1. Copier `.env.local.example` → `.env.local`, remplir les 4 valeurs Supabase + DATABASE_URL.
2. `npx prisma migrate dev --name init` (crée les tables).
3. Créer le bucket Storage `annonces` (SQL Editor dans Supabase, voir SQL ci-dessous).
4. Auth > URL Configuration : Site URL + Redirect URLs vers l'URL de déploiement.

### SQL du bucket Storage (à rejouer si nouveau projet)
```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('annonces', 'annonces', true, 5242880, '{"image/jpeg","image/png","image/webp"}')
on conflict (id) do nothing;
-- Politiques RLS : lecture publique, upload limité au dossier {userId}
create policy "annonces_lecture_publique" on storage.objects for select to public using (bucket_id = 'annonces');
create policy "annonces_upload_producteur" on storage.objects for insert to authenticated
with check (bucket_id = 'annonces' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "annonces_suppression_producteur" on storage.objects for delete to authenticated
using (bucket_id = 'annonces' and (storage.foldername(name))[1] = auth.uid()::text);
```

`.env.local` n'est JAMAIS commité (déjà dans `.gitignore`).

### Déploiement Vercel (configuré le 10 août 2026)

- **GitHub** : `lanlanndn/fourchette-et-fourche`, push automatique → déploiement Vercel.
- **Variables d'environnement Vercel** (Settings > Environment Variables — les valeurs réelles sont dans `.env.local`) :
  - `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé publique Supabase
  - `SUPABASE_SERVICE_ROLE_KEY` : clé secrète service_role
  - `DATABASE_URL` : `postgresql://postgres.{PROJECT_REF}:{DB_PASSWORD}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?uselibpqcompat=true&sslmode=require`
- ⚠️ **CRUCIAL** : Vercel utilise IPv6. La connexion directe Supabase ne supporte que l'IPv6, mais Vercel ne peut pas joindre le port PostgreSQL directement. **Il faut utiliser le pooler Session (port 5432)** avec `uselibpqcompat=true&sslmode=require`. Ne PAS utiliser la connexion directe (`db.xxx.supabase.co:5432`) ni le pooler Transaction (port 6543).
- Dans Supabase, les URLs de redirection Auth doivent inclure l'URL Vercel (Auth > URL Configuration).
- **Accès local depuis le réseau WiFi** : `npm run dev -- -H 0.0.0.0` puis `http://<IP_LOCALE>:3000` depuis un autre appareil.

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
- **`revalidatePath` interdit pendant le rendu** : pas de `revalidatePath` dans une fonction appelée directement par un Server Component (ex. `markConversationAsRead`). Next.js 15 le bloque. Le faire dans une Server Action appelée par un client component, ou l'omettre.
- **Supabase Storage upload** : le client browser (`createBrowserClient`) upload directement, les fichiers vont dans des dossiers par `userId`. La RLS vérifie que `(storage.foldername(name))[1] = auth.uid()::text`.
- **Prisma n'a pas de `postalCode` sur `Listing`** (contrairement à `User`) — ne pas l'inclure dans les `create`/`update`.
- **Prix** : le formulaire envoie `prixEuros` (string avec virgule française), l'action serveur convertit en `priceCents` (entier).
- **Déploiement Vercel** : utiliser le **Session pooler** (port 5432) et non la connexion directe ni le Transaction pooler. Format : `postgresql://postgres.{PROJECT_REF}:{PASSWORD}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?uselibpqcompat=true&sslmode=require`. La connexion directe (`db.xxx.supabase.co:5432`) ne fonctionne pas depuis Vercel (timeout réseau). Le Transaction pooler (port 6543) provoque des erreurs PgBouncer « prepared statement already exists » avec Prisma.
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

*Dernière mise à jour : 10 août 2026 — Phases 0-1-2-3-4-6 terminées et **déployées sur Vercel**. Supabase + GitHub + Vercel opérationnels. URL : `fourchette-et-fourche.vercel.app`.*
