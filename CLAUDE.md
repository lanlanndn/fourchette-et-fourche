# CLAUDE.md — Fourchette & Fourche 🍴

> **À lire en premier par toute IA qui reprend ce projet.**

---

## 1. Le projet

**Fourchette & Fourche** est une marketplace B2B française — « le Leboncoin de l'appro local ». Des **restaurateurs** découvrent des **producteurs/agriculteurs locaux** sur une carte interactive, consultent leurs annonces, les contactent, commandent et paient en ligne. La plateforme prend 10 % de commission.

- **Propriétaire** : Landry — **NON-CODEUR, francophone**. Voir §2.
- **Zone** : France entière.
- **Documents de référence** : `PRODUCT.md` (produit, audiences), `DESIGN.md` (système visuel « Enseigne peinte »), `GUIDE.md` (guide pour Landry).
- **Plan complet** : `/home/landry/.claude/plans/jazzy-baking-noodle.md`

---

## 2. Règles d'or avec Landry

1. **Toujours répondre en français**, sans jargon. Expliquer simplement.
2. Landry **n'écrit aucun code**. Ses seules actions : créer des comptes et copier-coller des clés — **le guider pas à pas, écran par écran**.
3. L'**interface est 100 % en français** (vouvoiement pro, ton chaleureux).
4. Ne jamais lui demander de choisir entre des technologies : choisir pour lui, expliquer en une phrase.
5. **Audience prioritaire : les producteurs** — chaque écran les persuade d'abord. **Anti-but : le rustique kitsch** (vichy, botte de paille, ferme en carton-pâte).

---

## 3. Stack

| Couche | Choix |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript strict + React 19 |
| Style | Tailwind CSS v4 — thème dans `globals.css` (palette `platre`/`outremer`/`garance`/`ocre`/`encre`) |
| BDD + Auth + Photos | Supabase (PostgreSQL + Auth + Storage) |
| ORM | Prisma 6 |
| Paiement | **Stripe Connect** — Checkout Sessions + destination charges (mode test, clés `sk_test`/`pk_test`) |
| Carte | Leaflet + react-leaflet 5 + OpenStreetMap |
| Géocodage | api-adresse.data.gouv.fr + geo.api.gouv.fr |
| Emails | Resend (pas encore configuré) |
| Hébergement | **Vercel** — `fourchette-et-fourche.vercel.app`, déploiement auto depuis GitHub |

**Commandes** : `npm run dev` / `npm run build` (jamais les deux en même temps !) / `npx tsc --noEmit`

---

## 4. État d'avancement (10 août 2026)

**Toutes les phases sont terminées et déployées** ✅

| Phase | Contenu |
|---|---|
| 0 — Fondations | Projet Next.js, header/footer, pages légales |
| 1 — Comptes | Inscription/connexion, rôles producteur/restaurateur, profil avec géocodage. Supabase configuré. |
| 2 — Annonces | Création/édition avec upload photos (Supabase Storage), activation/désactivation |
| 3 — Carte | Leaflet interactive, géolocalisation, filtres par rayon (haversine), sélection région/département |
| 4 — Messagerie | Conversations par annonce, badge messages non lus |
| 5 — Paiement | **Stripe Connect mode test** : onboarding producteur (Express), checkout (Checkout Session + destination charges), webhook `/api/webhooks/stripe`, pages commandes. Commission 10 %. |
| 6 — Finitions | SEO, page 404, mode démo (8 producteurs + 16 annonces factices) |

Mode démo : activé automatiquement si `DATABASE_URL` est absent.

**Prochaines étapes** (quand Landry sera prêt) : Resend (emails), domaine `fourchette-et-fourche.fr`, passage Stripe en mode live.

### Comptes
- **Supabase** : projet `tnwefomjxcbsallmcsvf` — PostgreSQL, Auth, Storage (bucket `annonces`, RLS)
- **GitHub** : `lanlanndn/fourchette-et-fourche` (branche `main`)
- **Vercel** : déploiement auto depuis GitHub
- **Stripe** : mode test — webhook `/api/webhooks/stripe`

---

## 5. Architecture clé

### Bascule démo ↔ production
`src/lib/donnees/index.ts` : `estModeDemo()`, `listerAnnonces()`, `getAnnonce()`… La constante `MODE_DEMO = !process.env.DATABASE_URL` choisit la source. **Les pages publiques passent TOUJOURS par cette couche**, jamais par Prisma ou demo.ts directement.
Les pages du tableau de bord importent Prisma directement (elles n'existent pas en mode démo).

### Auth
- `src/lib/auth.ts` : `getCurrentUser()`, `requireUser()`, `requireRole()`
- Middleware `src/middleware.ts` : rafraîchit la session Supabase (sauf `/api/webhooks`)

### Argent, catégories, géo
- **Argent toujours en centimes**. Affichage : `formaterPrix()` (dans `src/lib/constantes.ts`).
- `src/lib/constantes.ts` : `CATEGORIES`, `UNITES`, `CERTIFICATIONS`, `COULEURS_CATEGORIES`, `STATUTS_COMMANDE`.
- `src/lib/geo.ts` + `geo-metadata.ts` : géocodage, noms départements/régions.

### Carte (`src/components/carte/`)
- Wrapper `next/dynamic` **ssr:false** obligatoire pour Leaflet.
- Géométries dans `public/geojson/` (régions + départements, source gregoiredavid/france-geojson).
- **Conteneur avec hauteur fixe** (`h-[420px] lg:h-[560px]`) — jamais `h-full` vers un parent sans hauteur.

### Paiement
- `src/lib/stripe.ts` : client singleton + `calculerCommission()`.
- `src/lib/actions/paiement.ts` : onboarding producteur (Stripe Connect Express).
- `src/lib/actions/commandes.ts` : création commande + Checkout Session.
- `src/app/api/webhooks/stripe/route.ts` : `checkout.session.completed` → PAID + stock −1 + conversation auto ; `account.updated` → onboarding confirmé.

### Styles — monde « Enseigne peinte » (voir `DESIGN.md`)
- Polices : Caprasimo (`font-affiche`) + Chivo (`font-texte`).
- Utilitaires : `relief`/`relief-doux`, `cadre`, `filet`, `etiquette`, `champ`, `prix-peint`, `grain`, `coins`.
- **Règles dures** : angles 2-4 px, bordures encre 2 px, **pas de kicker au-dessus d'un titre**, **pas d'emoji décoratif** (icônes = `icones.tsx`), capitales Caprasimo avec `ombre-lettre`. Contrat de direction : commentaire HTML dans `src/app/layout.tsx` (seed d5e83781).

---

## 6. Pièges déjà rencontrés

- **`searchParams`/`params` sont des Promises** en Next 15 : toujours `await`.
- **`next/dynamic` ssr:false interdit dans un Server Component** → wrapper client obligatoire.
- **Ne JAMAIS lancer `npm run build` pendant que `npm run dev` tourne** → `.next` partagé casse tout. Réparer : `rm -rf .next`.
- **Carte Leaflet invisible** si `h-full` vers un parent sans hauteur → utiliser une hauteur fixe.
- **`revalidatePath` interdit pendant le rendu** (Server Component). Le faire uniquement dans une Server Action.
- **Prisma `Listing` n'a pas de `postalCode`** → ne pas l'inclure dans les mutations.
- **Prix** : formulaire envoie `prixEuros` (string "3,50"), l'action convertit en `priceCents` (entier 350).
- **Vercel + Supabase** : utiliser le **Session pooler** (port 5432) avec `uselibpqcompat=true&sslmode=require`. Pas le pooler Transaction (port 6543) ni la connexion directe.
- **Navigateur sous VPN** : `xdg-open` inutile pour localhost → utiliser `chromium` directement.
- **Commits** : `git -c user.name="Landry" -c user.email="landry@fourchette-fourche.local"` (pas de config git globale).

---

## 7. Checklist avant de livrer

1. `npx tsc --noEmit` passe.
2. `npm run build` passe (**dev arrêté**).
3. `npm run dev` + curl des pages touchées → 200.
4. Si visuel modifié : capture `chromium --headless` + relecture `DESIGN.md`.
5. Commits en français, concis.
6. Réponse à Landry : en français, simple, avec ce qu'il peut tester.

---

*Dernière mise à jour : 10 août 2026 — Phases 0–6 terminées, Stripe Connect mode test. URL : `fourchette-et-fourche.vercel.app`.*
