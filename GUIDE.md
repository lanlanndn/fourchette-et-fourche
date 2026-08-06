# 🍴 Guide de Landry — Fourchette & Fourche

Ce guide t'explique, pas à pas et **sans aucun code**, tout ce que tu auras à faire pour ton site.
Garde-le précieusement. Si quelque chose coince, dis-le moi (Claude) en français et je t'aide.

---

## 1. Lancer le site sur ton ordinateur

1. Ouvre un terminal dans le dossier du projet (`fourchette-et-fourche`).
2. Tape :
   ```
   npm run dev
   ```
3. Ouvre ton navigateur sur **http://localhost:3000**
4. Pour arrêter le site : `Ctrl + C` dans le terminal.

## 2. Les comptes à créer (gratuits)

Au fil des phases, tu auras besoin de ces comptes. Je te guiderai pour chacun **au moment où on en a besoin** — pas besoin de tout faire d'avance.

| Compte | À quoi ça sert | Quand |
|---|---|---|
| **GitHub** | Sauvegarde du code en ligne | Phase 0 |
| **Supabase** | Base de données, comptes utilisateurs, photos | Phase 1 |
| **Vercel** | Mettre le site en ligne (gratuit) | Quand tu veux montrer le site |
| **Stripe** | Encaisser les paiements (mode test d'abord) | Phase 5 |
| **Resend** | Envoyer les emails automatiques | Phase 4 |

## 3. Mettre le site en ligne (avec Vercel)

1. Je committe et pousse le code sur GitHub (`git push`).
2. Vercel détecte le changement et redéploie le site automatiquement.
3. Tu n'as rien à faire — juste me demander de pousser les changements.

## 4. Remplir la configuration (`.env.local`)

Le fichier `.env.local` contient les « clés » secrètes du site (base de données, paiement…).
- Il est créé en copiant `.env.local.example`.
- Chaque valeur se copie-colle depuis tes comptes en ligne.
- **Je te guiderai écran par écran** la première fois.
- ⚠️ Ne partage JAMAIS ce fichier ni son contenu publiquement.

## 5. Comment me demander des changements

Dis-moi simplement en français ce que tu veux, par exemple :
- « Change la couleur du bouton Commander en vert »
- « Ajoute une catégorie "Fruits de mer" »
- « Sur la page d'accueil, mets la carte plus grande »

Je fais la modification, je vérifie que tout marche, et je te dis quand c'est prêt à tester.

## 6. Avant d'encaisser de vrais paiements (checklist)

- [ ] Créer ton statut d'**auto-entrepreneur** (gratuit, sur autoentrepreneur.urssaf.fr) — obligatoire pour Stripe
- [ ] Activer le compte Stripe avec tes infos d'entreprise
- [ ] Rédiger CGV + mentions légales (je peux générer des gabarits à faire valider par un pro)
- [ ] Choisir le nom de domaine (~10-15 €/an, ex. sur OVH ou Gandi)

---

*Ce guide grandira au fil du projet. Dernière mise à jour : Phase 0.*
