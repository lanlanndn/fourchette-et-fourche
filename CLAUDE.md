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
| Emails | **Resend** — `src/lib/emails/` (envoi, gabarit, templates, notifications) |
| Hébergement | **Vercel** — `fourchette-et-fourche.vercel.app`, déploiement auto depuis GitHub |

**Commandes** : `npm run dev` / `npm run build` (jamais les deux en même temps !) / `npx tsc --noEmit`

---

## 4. État d'avancement (14 août 2026)

**Phases 0–8 terminées** ✅ — Phase 9 planifiée

| Phase | Contenu |
|---|---|
| 0 — Fondations | Projet Next.js, header/footer, pages légales |
| 1 — Comptes | Inscription/connexion, rôles producteur/restaurateur, profil avec géocodage. Supabase configuré. |
| 2 — Annonces | Création/édition avec upload photos (Supabase Storage), activation/désactivation |
| 3 — Carte | Leaflet interactive, géolocalisation, filtres par rayon (haversine), sélection région/département |
| 4 — Messagerie | Conversations par annonce, badge messages non lus |
| 5 — Paiement | **Stripe Connect mode test** : onboarding producteur (Express), checkout (Checkout Session + destination charges), webhook `/api/webhooks/stripe`, pages commandes. Commission 10 %. |
| 6 — Finitions | SEO, page 404, mode démo (8 producteurs + 16 annonces factices) |
| 7 — Emails | **Resend** : 5 templates (confirmation commande, nouvelle commande, nouveau message, paiement expiré, onboarding). Envoi synchrone (pas de fire-and-forget — Vercel coupe les tâches d'arrière-plan). Préférence `emailNotifications`. Route de diagnostic `/api/test-email`. |
| 8 — Facturation | **Factur-X natif (pdf-lib)** : à chaque commande payée, 3 factures générées automatiquement — FA (acheteur, total TTC), FV (vente autofacturée au nom du producteur), FC (commission 10 % + TVA 20 %). PDF/A-3 avec XML CII intégré (profil BASIC WL), stockés dans le bucket **privé** `factures`, envoyés par email Resend en pièces jointes, téléchargeables via URL signée. **Visibilité par rôle** : acheteur → FA seule, producteur → FV seule (page + email) ; FC = document interne plateforme (stockée, non affichée, téléchargement 403). Pages `/tableau-de-bord/factures` + bloc factures sur le détail commande. Route de diagnostic/rattrapage `/api/test-facture`. TVA par annonce (`Listing.tvaCents`, défaut 5,5 %), numéro TVA intracom sur le profil. Infos société via env `SOCIETE_*`. À prévoir avant le go-live : connexion PDP pour la réforme e-invoicing 2026-2028. |
| 9 — Livraison | 📋 **Planifié** — **ShipEngine** (multi-transporteurs : Mondial Relay, Colissimo, Chronopost) : étiquettes d'expédition, tracking, frais de port dans la commande. Alternative : statut manuel "Expédié" + lien tracking saisi par le producteur. |

Mode démo : activé automatiquement si `DATABASE_URL` est absent.

**Prochaines étapes** (quand Landry sera prêt) : acheter `fourchette-et-fourche.fr` (~10 €/an), vérifier le domaine dans Resend, compléter les `SOCIETE_*` (SIRET, TVA intracom, adresse), passer Stripe en mode live, puis Phase 9 (livraison).

### Comptes
- **Supabase** : projet `tnwefomjxcbsallmcsvf` — PostgreSQL, Auth, Storage (bucket public `annonces` RLS, bucket **privé** `factures`)
- **GitHub** : `lanlanndn/fourchette-et-fourche` (branche `main`)
- **Vercel** : déploiement auto depuis GitHub — variables : `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, clés Stripe, etc.
- **Stripe** : mode test — webhook `/api/webhooks/stripe`
- **Resend** : mode test (`onboarding@resend.dev`) — emails envoyés uniquement vers l'adresse du compte Resend tant que le domaine n'est pas vérifié

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
- `src/lib/stripe.ts` : client paresseux (`getStripe()`) + `calculerCommission()`.
- `src/lib/actions/paiement.ts` : onboarding producteur (Stripe Connect Express, API `controller`).
- `src/lib/actions/commandes.ts` : création commande + Checkout Session + compteur `countNouvellesCommandes()`.
- `src/lib/commandes-utils.ts` : `traiterCommandePayee()` — partagé entre le webhook et la page commandes.
- `src/app/api/webhooks/stripe/route.ts` : `checkout.session.completed` → PAID + stock −1 + conversation auto ; `account.updated` → onboarding confirmé.
- Badge de notification sur l'onglet Commandes (pastille garance, comme la messagerie).

### Emails (`src/lib/emails/`)
- `envoi.ts` : client Resend paresseux, détection clé absente/placeholder → skip silencieux. Supporte `attachments` (pièces jointes).
- `gabarit.ts` : palette, layout HTML 600 px (table inline), `echapperHtml()`, `urlApp()`.
- `templates.ts` : 7 contenus (confirmation acheteur, nouvelle commande, nouveau message, paiement expiré, onboarding terminé, facture acheteur, factures producteur).
- `notifications.ts` : 4 notifiers publics, chacun planifie l'envoi dans `after()` de `next/server` (non bloquant).
- **Règle** : emails de commande/factures = toujours ; emails informatifs = respectent `User.emailNotifications`.
- **Piège** : `RESEND_API_KEY` placeholder `re_a-coller-plus-tard` → emails silencieusement désactivés. Clé réelle = `re_` + longueur.

### Facturation (`src/lib/facturation/`)
- `generer.ts` : `genererFacturesCommande(orderId)` — orchestration **idempotente, ne lève jamais** (appelée depuis `traiterCommandePayee`). Génère FA/FV/FC → XML → PDF → upload bucket privé → emails avec PJ. Auto-réparation si une row a un `storagePath` vide.
- `xml.ts` : XML CII Factur-X **BASIC WL** (`urn:factur-x.eu:1p0:minimum`). `pdf.ts` : PDF/A-3 via pdf-lib (XMP injecté à la main, OutputIntent sRGB, `attach` avec `AFRelationship.Data`, polices standard Helvetica).
- `constantes.ts` : préfixes FA/FV/FC, `ventilerTva()` (arrondis lignes ↔ totaux cohérents), codes UNECE, `infosSociete()` (env `SOCIETE_*`).
- Modèle `Invoice` (Prisma) : numéro `FA-2026-00001`, `@@unique([type, sequence, annee])`, séquence par type+annee avec retry P2002. **La row est créée AVANT le PDF** pour que le PDF porte le numéro définitif.
- **Visibilité par rôle** : FA → `order.buyerId` ; FV → `emitPourUserId` ; FC → personne (403 au téléchargement). Appliqué sur `/tableau-de-bord/factures`, le détail commande et les emails (FA seule au restaurateur, FV seule au producteur).
- Téléchargement : `/api/factures/[id]/telecharger` (autorisation par rôle, URL signée 60 s via `src/lib/supabase/admin.ts`). Bucket **privé** `factures` (créé par `scripts/creer-bucket-factures.mjs`).
- Diagnostic/rattrapage : `GET /api/test-facture?orderId=…`. Maintenance : `scripts/regenerer-factures.mjs <orderIds…>` (supprime rows + fichiers pour régénérer — à lancer par Landry avec `!`).
- **Piège** : ne jamais `after()`/fire-and-forget pour la génération — tout est `await` dans le flux principal.

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
- **Supabase — connexion directe IPv6 uniquement** : `db.<ref>.supabase.co:5432` ne résout qu'en AAAA depuis ~août 2026 → « Network is unreachable » sur les machines sans IPv6 (500 en local). Utiliser le **pooler session** : `postgresql://postgres.<ref>:<mdp>@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require` (région de ce projet : eu-west-1, cluster aws-1 ; l'utilisateur DOIT être `postgres.<ref>`). Vercel (IPv6 OK) fonctionne avec l'ancienne URL — ne pas y toucher. **Ne pas modifier `.env.local` sans demander à Landry** (il gère son serveur local à la main).
- **Prisma CLI ne lit pas `.env.local`** → préfixer avec `node --env-file=.env.local node_modules/.bin/prisma …`.
- **`prisma migrate dev` impossible via le pooler** (pas de shadow DB) → procédure manuelle : `npx prisma migrate diff --from-schema-datamodel <ancien.prisma> --to-schema-datamodel prisma/schema.prisma --script` (ancien via `git show HEAD:prisma/schema.prisma`) → créer `prisma/migrations/<ts>_nom/migration.sql` → `prisma db execute --url <pooler> --file …` → INSERT dans `_prisma_migrations` (id, checksum = sha256 du fichier, migration_name, applied_steps_count).
- **pdf-lib `attach()`** : une **chaîne** est interprétée comme du **base64** (comme ses autres API) → toujours passer `new TextEncoder().encode(xml)`. Vérifier les PDF générés en extrayant le flux EmbeddedFile (compressé zlib 0x789C → `zlib.inflateSync` ; le catalog est dans un ObjStm compressé, les noms avec espaces sont échappés `#20`).
- **Numéro de facture** : attribuer la row Prisma (numéro définitif) AVANT de construire le PDF — sinon le PDF porte un numéro provisoire.
- **Actions destructives sur la base partagée** : le classificateur les bloque — Landry les exécute lui-même en collant la commande précédée de `!` (ex : `scripts/regenerer-factures.mjs`).
- **Navigateur sous VPN** : `xdg-open` inutile pour localhost → utiliser `chromium` directement.
- **Commits** : `git -c user.name="Landry" -c user.email="landry@fourchette-fourche.local"` (pas de config git globale).
- **Emails sur Vercel** : ne pas utiliser `after()` ou fire-and-forget pour l'envoi d'emails — Vercel serverless coupe les Promise non attendues. Toujours `await` l'envoi dans le flux principal (coût ~200 ms).

---

## 7. Checklist avant de livrer

1. `npx tsc --noEmit` passe.
2. `npm run build` passe (**dev arrêté**).
3. `npm run dev` + curl des pages touchées → 200.
4. Si visuel modifié : capture `chromium --headless` + relecture `DESIGN.md`.
5. Commits en français, concis.
6. Réponse à Landry : en français, simple, avec ce qu'il peut tester.

---

*Dernière mise à jour : 14 août 2026 — Phases 0–8 terminées et vérifiées de bout en bout. Phase 9 planifiée. Facturation Factur-X (3 factures par commande : FA acheteur, FV vente autofacturée, FC commission interne) déployée et validée (numéros, montants, XML intégré, autorisations). Emails Resend fonctionnels (7 templates, envoi synchrone). Paiement Stripe Connect testé de bout en bout. URL : `fourchette-et-fourche.vercel.app`.*
