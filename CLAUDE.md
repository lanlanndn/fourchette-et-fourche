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
| Livraison | **Sendcloud (API v3)** — bordereaux d'envoi (transporteur Mondial Relay), `src/lib/expedition/` |
| Emails | **Resend** — `src/lib/emails/` (envoi, gabarit, templates, notifications) |
| Hébergement | **Vercel** — `fourchette-et-fourche.vercel.app`, déploiement auto depuis GitHub |

**Commandes** : `npm run dev` / `npm run build` (jamais les deux en même temps !) / `npx tsc --noEmit`

**Variables d'environnement** (`.env.local` + variables Vercel) : `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `PLATFORM_COMMISSION_PERCENT`, `PLATFORM_COMMISSION_TVA_PERCENT` (défaut 20), `RESEND_API_KEY`, `EMAIL_FROM`, les `SENDCLOUD_PUBLIC_KEY` / `SENDCLOUD_SECRET_KEY` (+ `SENDCLOUD_CARRIER` défaut `mondial_relay`, `SENDCLOUD_SHIPPING_OPTION` optionnel) pour la livraison, et les `SOCIETE_*` pour les factures (`SOCIETE_NOM`, `SOCIETE_SIRET`, `SOCIETE_TVA_INTRA`, `SOCIETE_ADRESSE`, `SOCIETE_VILLE`, `SOCIETE_CODE_POSTAL` — vides → « à compléter » sur les PDF). Détail dans `.env.local.example`. **Ne jamais modifier `.env.local` sans demander à Landry.**

---

## 4. État d'avancement (14 août 2026)

**Phases 0–8 terminées** ✅ — **Phase 9 implémentée** ✅

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
| 9 — Livraison | ~~Suivi manuel simple~~ (remplacé par la Phase 10). Garde-fous statut, badges de statut. |
| 10 — Livraison Mondial Relay | **« Comme Vinted »** : frais de port calculés selon le poids (`Listing.poidsGrammes`, grille dans `src/lib/expedition/tarifs.ts`, max 30 kg) et **inclus dans le paiement** (2e ligne du Checkout Stripe). **Stripe Checkout collecte l'adresse de livraison + téléphone** (`shipping_address_collection` + `phone_number_collection`, enregistrés via `enregistrerAdresseLivraison` — API 2026 : `session.collected_information.shipping_details`). **Bordereau généré automatiquement au paiement** via **Sendcloud (API v3)** — `POST /api/v3/shipments/announce` (Basic auth, option d'expédition auto-détectée : première option « domicile » du transporteur `SENDCLOUD_CARRIER`, défaut `mondial_relay` ; PDF en base64 ou lien, archivé dans le bucket **privé** `bordereaux`). Le vendeur télécharge le bordereau (`BordereauBloc`), clique « Colis déposé » (`expedierCommandeAction` simplifiée — transporteur + suivi remplis automatiquement) puis « livrée ». L'acheteur suit via `BlocSuivi`. **Argent** : `application_fee_amount = commission + frais de port` → le port remonte à la plateforme qui paie les bordereaux ; le producteur reçoit toujours `produits − 10 %`. **Factures** : FA/FV avec ligne port TVA 20 %, FC = commission + port. Emails : adresse + poids dans « nouvelle commande », port dans la confirmation. Routes `/api/bordereaux/[orderId]/telecharger` (producteur seul) et `/api/test-bordereau?orderId=…` (diagnostic/rattrapage). Clés `SENDCLOUD_PUBLIC_KEY`/`SENDCLOUD_SECRET_KEY` (panel Sendcloud → Settings → Integrations). Test sans frais possible avec l'option `sendcloud:letter` (env `SENDCLOUD_SHIPPING_OPTION`). |

Mode démo : activé automatiquement si `DATABASE_URL` est absent.

**Prochaines étapes** (quand Landry sera prêt) : acheter `fourchette-et-fourche.fr` (~10 €/an), vérifier le domaine dans Resend, compléter les `SOCIETE_*` (SIRET, TVA intracom, adresse), passer Stripe en mode live.

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
- **Depuis la Phase 10** : `application_fee_amount = commissionCents + shippingPriceCents` (le port remonte à la plateforme pour payer le bordereau) ; le Checkout a 2 lignes (produits + port), collecte l'adresse (`shipping_address_collection`) et le téléphone (`phone_number_collection`).

### Livraison (`src/lib/expedition/`)
- `tarifs.ts` : grille de port par tranche de poids, `calculerFraisPort()` (pur, côté client aussi), `POIDS_MAX_GRAMMES` (30 kg), `formaterPoids()`.
- `sendcloud.ts` : client Sendcloud API v3 (Basic auth clé publique/clé secrète) — `creerBordereau()` (POST `/api/v3/shipments/announce`, option choisie via `SENDCLOUD_SHIPPING_OPTION` ou auto-détection via POST `/api/v3/shipping-options/…` filtré `carrier_code` + `last_mile=home_delivery`) → `{ numeroExpedition, transporteur, trackingUrl, urlPdf?, pdfBase64? }`.
- `generer.ts` : `genererBordereau(orderId)` — idempotent, ne lève jamais, appelé par `traiterCommandePayee` après la facturation ; archive le PDF dans le bucket privé `bordereaux` et remplit transporteur/suivi.
- `commandes-utils.ts` : `enregistrerAdresseLivraison(orderId, session)` — copie l'adresse Stripe sur la commande (webhook **et** page de retour, idempotent via `where shippingAddressLigne1: null`).
- Routes : `GET /api/bordereaux/[orderId]/telecharger` (producteur concerné uniquement, URL signée 60 s), `GET /api/test-bordereau?orderId=…` (diagnostic/rattrapage).
- `BordereauBloc.tsx` : bloc vendeur (adresse + poids + téléchargement + « Colis déposé »). `expedierCommandeAction` n'accepte plus que `orderId` (transporteur/suivi viennent du bordereau).

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

### Routes API
- `POST /api/webhooks/stripe` — webhook (signature vérifiée ; sans `DATABASE_URL` → no-op)
- `GET /api/test-email` — diagnostic Resend (envoie un email de test)
- `GET /api/test-facture?orderId=…` — diagnostic/rattrapage facturation (sans `orderId` → dernière commande PAID)
- `GET /api/factures/[id]/telecharger` — URL signée 60 s, autorisation par rôle (FA → acheteur, FV → producteur, FC → personne)
- `GET /api/bordereaux/[orderId]/telecharger` — bordereau PDF, producteur concerné uniquement, URL signée 60 s
- `GET /api/test-bordereau?orderId=…` — diagnostic/rattrapage bordereau (sans `orderId` → dernière commande PAID)

### Sécurité (rappels)
- Webhook Stripe : signature `STRIPE_WEBHOOK_SECRET` vérifiée (`constructEventAsync`) — ne jamais se fier au body sans signature.
- `SUPABASE_SERVICE_ROLE_KEY` : uniquement côté serveur (`src/lib/supabase/admin.ts`, scripts) — jamais dans une variable `NEXT_PUBLIC_*` ni dans un composant client.
- Bucket `factures` **privé** (données personnelles) → téléchargement uniquement via URL signée + vérification d'appartenance (403 sinon).
- Autorisations des pages tableau de bord : `requireUser()` / `requireRole()` + vérifications d'appartenance (annonces, commandes, conversations).

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
- **Stripe API 2026 (`2026-07-29.dahlia`)** : l'adresse collectée par Checkout n'est plus `session.shipping_details` mais `session.collected_information.shipping_details` (`{ address, name }`) ; le téléphone est dans `session.customer_details.phone`.
- **Sendcloud API v3** : les nouveaux comptes n'ont PAS accès à l'API v2 (`/api/v2/parcels` est en maintenance) — utiliser v3 (`POST /api/v3/shipments/announce`, auth Basic clé publique:clé secrète). Réponse : `parcels[0].tracking_number` + `label_file` (base64, colis unique) ou `parcels[0].documents[].link`. Le colis peut être créé (201) mais non annoncé : toujours vérifier le tableau `errors` (`parcel_announcement_error`) et `status.code === "ANNOUNCEMENT_FAILED"`. Test gratuit : option `sendcloud:letter` (env `SENDCLOUD_SHIPPING_OPTION=sendcloud:letter`). En cas d'échec, `genererBordereau` log `[bordereau]` sans casser la commande — rattrapage via `/api/test-bordereau`. Téléphone du destinataire OBLIGATOIRE pour le domicile.
- **Appliquer une migration en base** : `node --env-file=.env.local scripts/appliquer-migration-livraison-mondial-relay.mjs` (idempotent) — à exécuter par Landry avec `!` (base partagée). Le déploiement Vercel doit attendre la migration (sinon 500 sur les commandes).

---

## 7. Checklist avant de livrer

1. `npx tsc --noEmit` passe.
2. `npm run build` passe (**dev arrêté**).
3. `npm run dev` + curl des pages touchées → 200.
4. Si visuel modifié : capture `chromium --headless` + relecture `DESIGN.md`.
5. Commits en français, concis.
6. Réponse à Landry : en français, simple, avec ce qu'il peut tester.

## 8. Comment tester

### Tester un paiement + les factures (bout en bout)
- **Comptes de test** (Supabase Auth) : restaurateur « Le Pinochti » (`landry.etave@outlook.fr`) et producteur « Le Mardereau » (`landryetave2@outlook.fr`) — mode test Stripe.
- **Carte Stripe test** : `4242 4242 4242 4242`, exp. `12/34`, CVC `424`, code postal `42424`.
- En local, pas besoin de `stripe listen` : le retour `?paiement=succes&session_id=…` sur `/tableau-de-bord/commandes` déclenche aussi `traiterCommandePayee` → factures + emails.
- Vérifier ensuite : table `Invoice` (3 rows FA/FV/FC, numéros, montants), PDF dans le bucket `factures`, emails Resend reçus (test mode → uniquement l'adresse du compte Resend), page « Mes factures » des deux rôles.
- **Analyser un PDF de facture** : extraire le flux EmbeddedFile (zlib `inflateSync`), comparer `<ram:ID>` au numéro en base et les totaux (voir piège pdf-lib au §6).

### Vérifier qu'un déploiement Vercel est en ligne
```bash
curl https://fourchette-et-fourche.vercel.app/api/test-facture?orderId=inexistant
```
Réponse JSON `{"orderId":"inexistant",…}` = nouveau build actif (avant déploiement : 404). Aucun effet de bord avec un `orderId` inexistant.

### Mode démo
Sans `DATABASE_URL`, le site public s'affiche avec les données factices (8 producteurs, 16 annonces) — utile pour tester le visuel sans base.

---

*Dernière mise à jour : 17 août 2026 — Phase 10 (livraison « comme Vinted » via Sendcloud/Mondial Relay) implémentée : frais de port par poids inclus au paiement, adresse + téléphone collectés par Stripe Checkout, bordereau généré automatiquement au paiement et archivé en bucket privé, bloc vendeur « Expédier la commande » avec téléchargement du bordereau et « Colis déposé », suivi automatique, factures avec ligne port TVA 20 % (FC = commission + port). Migration appliquée en base (20260817150000_livraison_mr), bucket `bordereaux` créé. RESTE À FAIRE : clés Sendcloud (panel → Integrations), test bout en bout (option `sendcloud:letter` gratuite d'abord), ajuster la grille de tarifs de port avec les vrais tarifs. Phases 0–9 livrées et déployées (commit `be0b462`). URL : `fourchette-et-fourche.vercel.app`.*

---

## 9. Commandes — détail d'architecture (session du 17 août 2026)

### Modèle de données (`prisma/schema.prisma`)

```prisma
enum OrderStatus {
  PENDING_PAYMENT
  PAID
  CANCELLED
  REFUNDED
  DISPUTED
}

model Order {
  id              String      @id @default(cuid())
  buyerId         String
  buyer           User        @relation("BuyerOrders", fields: [buyerId], references: [id])
  status          OrderStatus @default(PENDING_PAYMENT)
  totalCents      Int
  commissionCents Int

  deliveryStatus       DeliveryStatus @default(NOT_SHIPPED)
  shippingCarrier      String?
  shippingTrackingNumber String?
  shippingTrackingUrl  String?
  shippedAt            DateTime?
  deliveredAt          DateTime?

  stripePaymentIntentId String? @unique
  stripeChargeId        String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  items     OrderItem[]
  invoices  Invoice[]
  @@index([buyerId])
  @@index([deliveryStatus])
}

enum DeliveryStatus {
  NOT_SHIPPED
  SHIPPED
  DELIVERED
}

model OrderItem {
  id             String  @id @default(cuid())
  orderId        String
  order          Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  listingId      String
  listing        Listing @relation(fields: [listingId], references: [id], onDelete: Restrict)
  quantity       Float
  unitPriceCents Int
  subtotalCents  Int
  @@index([orderId])
}
```

**La livraison est gérée manuellement** : le producteur saisit le transporteur, le numéro de suivi et un lien de suivi optionnel, puis peut marquer la commande comme livrée. Les frais de port ne sont pas encore calculés automatiquement (hors plateforme en v1).

### Statuts et affichage

- Enum Prisma : `PENDING_PAYMENT`, `PAID`, `CANCELLED`, `REFUNDED`, `DISPUTED`.
- Enum livraison : `NOT_SHIPPED`, `SHIPPED`, `DELIVERED`.
- Affichage dans `src/lib/constantes.ts` : `STATUTS_COMMANDE` et `STATUTS_LIVRAISON` avec labels et classes Tailwind.
- Badge "commandes en attente" (`countNouvellesCommandes` dans `src/lib/actions/commandes.ts`) = commandes `PAID` concernant le producteur connecté.

### Flux de création / paiement

1. **Côté annonce** : `src/components/FormulaireCommande.tsx` → action `creerCommandeAction` (`src/lib/actions/commandes.ts`).
2. **Création commande** :
   - Vérifie rôle `RESTAURATEUR`, stock suffisant, producteur onboardé Stripe.
   - Calcule `totalCents = listing.priceCents * quantite`.
   - Calcule `commissionCents = calculerCommission(totalCents)` (10 %).
   - Crée `Order` + `OrderItem` avec `status: "PENDING_PAYMENT"`.
3. **Checkout Stripe** : Stripe Checkout Session en mode `payment` avec :
   - `payment_intent_data.application_fee_amount = commissionCents`
   - `transfer_data.destination = producer.stripeAccountId`
   - `metadata.orderId = order.id`
   - `success_url` / `cancel_url` vers `/tableau-de-bord/commandes?paiement=succes|annule`
4. **Paiement réussi** — deux entrées convergent vers `traiterCommandePayee(orderId, paymentIntentId)` (`src/lib/commandes-utils.ts`) :
   - Webhook Stripe `checkout.session.completed` (`src/app/api/webhooks/stripe/route.ts`).
   - Page de retour `/tableau-de-bord/commandes` qui appelle `stripe.checkout.sessions.retrieve(session_id)`.
5. **`traiterCommandePayee`** (idempotent) :
   - Passe `Order.status` à `PAID` via `updateMany` (race-condition safe).
   - Décrémente `Listing.quantityAvailable`, incrémente `quantitySold`.
   - Crée une conversation automatique si elle n'existe pas.
   - Appelle `notifierCommandePayee(orderId)` → emails acheteur + producteur.
   - Appelle `genererFacturesCommande(orderId)` → 3 factures Factur-X (FA/FV/FC).
6. **Paiement expiré** : webhook `checkout.session.expired` → `CANCELLED` + email `notifierPaiementExpire`.

### Pages UI commandes

| Fichier | Rôle |
|---|---|
| `src/components/FormulaireCommande.tsx` | Formulaire quantité + bouton "Payer avec Stripe" |
| `src/app/annonces/[id]/page.tsx` | Page produit qui intègre le formulaire |
| `src/app/tableau-de-bord/commandes/page.tsx` | Liste des commandes + traitement retour Stripe |
| `src/app/tableau-de-bord/commandes/[id]/page.tsx` | Détail commande (articles, résumé financier, livraison, factures) |
| `src/components/FormulaireExpedition.tsx` | Formulaire producteur : transporteur + numéro de suivi + lien |
| `src/components/FormulaireLivree.tsx` | Bouton producteur : marquer comme livrée |
| `src/components/BlocSuivi.tsx` | Affichage du suivi (acheteur et producteur) |
| `src/lib/actions/livraison.ts` | Actions serveur `expedierCommandeAction` + `marquerLivreeCommandeAction` |
| `src/app/tableau-de-bord/layout.tsx` | Menu + badge commandes en attente |
| `src/app/tableau-de-bord/page.tsx` | Tuile "Mes commandes" pour restaurateur |

### Facturation liée aux commandes

- `Invoice` a un `orderId` et appartient à un `Order` (`Order.invoices`).
- 3 factures générées automatiquement à chaque commande `PAID` :
  - `ACHETEUR` (FA) — visible par le restaurateur.
  - `VENTE` (FV) — autofacturation, visible par le producteur.
  - `COMMISSION` (FC) — document interne plateforme, non visible.
- Orchestration : `src/lib/facturation/generer.ts`.
- Téléchargement : `src/app/api/factures/[id]/telecharger/route.ts`.
- Pages : `src/app/tableau-de-bord/factures/page.tsx`.
- Diagnostic : `GET /api/test-facture?orderId=…`.

### Livraison (Phase 9 — implémentée)

- Le producteur saisit le transporteur, le numéro de suivi et un lien de suivi optionnel via `FormulaireExpedition` → action `expedierCommandeAction`.
- La commande passe à `deliveryStatus = SHIPPED`, un email "Commande expédiée" est envoyé à l'acheteur (`notifierCommandeExpediee`).
- Le producteur peut ensuite marquer la commande comme livrée via `FormulaireLivree` → action `marquerLivreeCommandeAction` (refuse si la commande n'est pas `PAID`).
- La commande passe à `DELIVERED`, un email "Commande livrée" est envoyé à l'acheteur (`notifierCommandeLivree`, template `emailCommandeLivree`).
- L'acheteur voit le bloc de suivi (`BlocSuivi`) dans le détail de sa commande.
- Liste des commandes : badge statut commande toujours affiché, + badge livraison côté producteur dès qu'un suivi existe (`afficherStatutLivraison`).
- Détail commande : les factures restent visibles pour `PAID`, `REFUNDED` et `DISPUTED`.
- **Piège** : URLs de suivi dans les emails — ne pas passer par `echapperHtml()` dans un attribut `href` (les `&` seraient cassés) ; l'URL est déjà validée par Zod côté action.
- Les frais de port ne sont pas gérés par la plateforme en v1 (reporté à une intégration transporteur ultérieure).
- Migration appliquée en base via `scripts/appliquer-migration-livraison.mjs` (idempotent, instructions exécutées une par une — PostgreSQL refuse plusieurs commandes dans un envoi préparé).

### Fichiers essentiels modifiés / créés pour la Phase 9

- `prisma/schema.prisma`
- `prisma/migrations/20260817120000_livraison/migration.sql`
- `src/lib/constantes.ts`
- `src/lib/actions/livraison.ts`
- `src/components/FormulaireExpedition.tsx`
- `src/components/FormulaireLivree.tsx`
- `src/components/BlocSuivi.tsx`
- `src/components/icones.tsx`
- `src/app/tableau-de-bord/commandes/page.tsx`
- `src/app/tableau-de-bord/commandes/[id]/page.tsx`
- `src/lib/emails/templates.ts`
- `src/lib/emails/notifications.ts`
