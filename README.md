# 🍴 Fourchette & Fourche

La marketplace qui met en relation les **restaurateurs** avec les **producteurs locaux**.
Du champ à l'assiette, en direct.

> 👤 **Tu es Landry ?** Lis d'abord [GUIDE.md](./GUIDE.md) — tout y est expliqué sans jargon.

## Stack technique

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Supabase** : PostgreSQL + Auth + Storage (photos)
- **Prisma** (ORM)
- **Stripe Connect** : paiements avec commission (Phase 5)
- **Leaflet + OpenStreetMap** : carte interactive (Phase 3)
- **Resend** : emails (Phase 4)

## Développement

```bash
npm install        # première fois seulement
npm run dev        # lance le site sur http://localhost:3000
```

## Base de données

```bash
npx prisma migrate dev    # appliquer les migrations (nécessite DATABASE_URL)
npx prisma studio         # voir les données dans le navigateur
```

## Structure

```
prisma/schema.prisma   → le schéma de la base de données
src/app/               → les pages du site
src/components/        → les morceaux d'interface réutilisables
src/lib/               → les outils (connexion BDD, Stripe, etc.)
```

## Phases du projet

- [x] **Phase 0** — Fondations (site vitrine en ligne)
- [ ] **Phase 1** — Comptes restaurateurs / producteurs
- [ ] **Phase 2** — Annonces avec photos
- [ ] **Phase 3** — Carte interactive
- [ ] **Phase 4** — Messagerie
- [ ] **Phase 5** — Commande + paiement avec commission
- [ ] **Phase 6** — Finitions et lancement
