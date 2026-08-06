---
name: Fourchette & Fourche
description: Marketplace B2B française, du producteur au restaurateur, habillée comme un mur peint par un lettreur artisanal.
colors:
  platre: "#f1eada"
  platre-fonce: "#e3d7bc"
  outremer: "#1e3f8c"
  outremer-nuit: "#152c66"
  garance: "#b93a1d"
  garance-fonce: "#93290f"
  ocre: "#dda92c"
  verdigris: "#2f6b4f"
  prune: "#7a3b54"
  havane: "#7a5230"
  encre: "#28221b"
  encre-doux: "#6b5f4e"
typography:
  display:
    fontFamily: "Caprasimo, Georgia, serif"
    fontSize: "clamp(2.9rem, 7vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Caprasimo, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.1
  title:
    fontFamily: "Caprasimo, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  xs: "1px"
  sm: "2px"
  md: "3px"
  lg: "4px"
  xl: "4px"
  2xl: "4px"
components:
  button-primary:
    backgroundColor: "{colors.garance}"
    textColor: "{colors.platre}"
    rounded: "{rounded.sm}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.garance-fonce}"
  button-secondary:
    backgroundColor: "{colors.platre}"
    textColor: "{colors.encre}"
    rounded: "{rounded.sm}"
    padding: "16px 32px"
  button-secondary-hover:
    backgroundColor: "{colors.platre-fonce}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.encre}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  input:
    backgroundColor: "#fbf7ec"
    textColor: "{colors.encre}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  card:
    backgroundColor: "#fbf7ec"
    textColor: "{colors.encre}"
    rounded: "{rounded.sm}"
    padding: "0px"
---

# Design System: Fourchette & Fourche

## Overview

**Creative North Star: "L'Enseigne Peinte du Marché de Village"**

Fourchette & Fourche s'habille comme un mur de plâtre peint à la main par un lettreur français du milieu du XXe siècle. La typographie monumentale porte l'identité : pas de photos, pas de logos corporate, seulement des capitales peintes, des filets d'encre, des plaques de département ocres et des ombres-relief franches. L'interface doit rassurer un producteur pressé en deux secondes : ici, il vend aux restaurants du coin, il fixe ses prix, la commission est de 10 %, il n'y a pas d'abonnement.

Le système est volontairement austère et chaleureux à la fois. Les surfaces ressemblent à des panneaux de bois ou d'émail cloués au mur ; les angles sont presque carrés, les bords sont marqués d'un trait épais, et les transitions restent rapides et utilitaires. La couleur est appliquée par rôles métier : outremer pour la marque et la géographie, garance pour l'action, ocre pour les repères départementaux, verdigris pour le bio et la validation.

**Key Characteristics:**
- Mur de plâtre comme toile de fond, encre noire comme trait dominant.
- Caprasimo en capitales peintes pour les titres ; Chivo pour le corps et les étiquettes.
- Angles quasi-carrés (2–4 px), bords de 2 px, ombres-relief décalées franches.
- Carte interactive comme cœur du produit ; géographie avant catalogue.
- Pictogrammes dessinés à la main (SVG) ; emojis réservés aux marqueurs de carte.
- Aucune photo réelle, aucun héro centré à dégradé, aucune carte arrondie décorative.

## Colors

La palette est celle d'un peintre en bâtiment travaillant sur enduit : des encres vives mais légèrement poussiéreuses, un fond de plâtre chaud, et des accents métier lisibles à distance.

### Primary
- **Outremer peint** (`#1e3f8c`): la marque, les titres de sections froides, les contours de la carte, les CTAs secondaires pour les restaurateurs.
- **Outremer-nuit** (`#152c66`): fonds profonds (footer, CTA final), états hover des éléments outremer.

### Secondary
- **Garance** (`#b93a1d`): actions principales, prix, boutons d'inscription, étapes numérotées producteur. C'est l'encre d'action.
- **Garance-foncé** (`#93290f`): hover des boutons garance, sélection de département sur la carte.

### Tertiary
- **Ocre** (`#dda92c`): plaques départementales, frie de marqueur, filets décoratifs, accents chaleureux dans les titres.
- **Verdigris** (`#2f6b4f`): certifications bio, succès des messages, catégories légumes/huile/herbes.
- **Prune** (`#7a3b54`): catégories viande et vin.
- **Havane** (`#7a5230`): catégories volaille et bière.

### Neutral
- **Plâtre** (`#f1eada`): fond de page, fond des cartes claires, texte sur fonds sombres.
- **Plâtre-foncé** (`#e3d7bc`): bandes, frises, fonds de section légèrement plus sombres.
- **Encre** (`#28221b`): texte principal, bordures, ombres, icônes.
- **Encre-doux** (`#6b5f4e`): texte secondaire, descriptions, placeholders.
- **Craie** (`#fbf7ec`): fond des champs, fond des popups, fond interne des cartes d'annonce.

### Named Rules
**The One-Garance Rule.** Garance est réservée aux actions et aux prix. Elle ne décore pas ; elle incite ou elle affiche un coût.

**The Category-Ink Rule.** Chaque catégorie de produit a une encre fixe (`COULEURS_CATEGORIES` dans `src/lib/constantes.ts`). On ne réinvente pas la couleur d'une famille.

## Typography

**Display Font:** Caprasimo (fallback Georgia, serif)
**Body Font:** Chivo (fallback system-ui, sans-serif)

**Character:** Caprasimo donne l'empreinte du lettreur : des capitales robustes, légèrement irrégulières, qui dominent le mur. Chivo apporte la lisibilité utilitaire des étiquettes de marché : chiffres clairs, petites tailles serrées, allure sans fioriture.

### Hierarchy
- **Display** (400, clamp(2.9rem, 7vw, 4.5rem), line-height 0.95): héros de la page d'accueil, deux lignes de capitales peintes avec ombre-lettre.
- **Headline** (400, clamp(2.25rem, 5vw, 3rem), line-height 1.1): titres de section (`h2`), centrés ou alignés à gauche selon la section.
- **Title** (400, 1.5rem, line-height 1.2): titres de carte (`h3`), titres des blocs "Pour les producteurs / restaurateurs".
- **Body** (400, 1rem, line-height 1.625): paragraphes, descriptions, listes. Longueur de ligne cible 60–70 ch.
- **Label** (700, 0.72rem, letter-spacing 0.14em, uppercase): navigation, étiquettes, badge démo, catégories. La voix des enseignes.
- **Price** (400, 1.5–2.25rem, tabular-nums): chiffres peints, toujours en Caprasimo, toujours alignés pour la comparaison.

### Named Rules
**The Painted Capitals Rule.** Les titres sont en capitales, en Caprasimo, avec un ombre-lettre ocre ou encre. Pas de casse mixte dans les grands titres.

**The One-Line Label Rule.** Les étiquettes (`etiquette`) sont petites, grasses, espacées, en capitales. Elles portent la hiérarchie secondaire, pas le contenu principal.

## Layout

Le site utilise un conteneur unique centré (`max-w-6xl`, `mx-auto`) avec des gouttières de `px-4` sur mobile et des sections empilées verticalement. La grille du héros passe de 1 colonne à 7/5 sur `lg`. Les listes d'annonces utilisent une grille responsive (`sm:grid-cols-2 lg:grid-cols-3`).

L'espacement suit l'échelle Tailwind par défaut, avec une densité moyenne : les sections portent `py-16` à `py-24`, les blocs de contenu s'espacent de `gap-4` à `gap-12`. Le header est sticky (`top-0 z-50`) avec un fond plâtre opaque pour marquer le mur.

Responsive : mobile d'abord. Les éléments du héros s'empilent, les deux étiquettes épinglées disparaissent sous `lg`, le menu header passe en version raccourcie sous `md`.

## Elevation & Depth

La profondeur ne vient pas de gradients ni d'ombres floues, mais de plaques et de lettres légèrement en relief sur le mur. Le système utilise des ombres décalées pleines (`relief`) pour suggérer des éléments cloués ou collés au plâtre, et des filets intérieurs pour encadrer.

### Shadow Vocabulary
- **Relief fort** (`box-shadow: 4px 4px 0 0 rgb(40 34 27 / 0.9)`): boutons primaires, cartes principales, blocs "Comment ça marche". Simule une plaque épaisse.
- **Relief doux** (`box-shadow: 3px 3px 0 0 rgb(40 34 27 / 0.25)`): cartes d'annonce au repos, boîtes de filtres, triptyque.
- **Relief hover** (`box-shadow: 6px 6px 0 0 rgb(40 34 27 / 0.9)` ou `0.35` pour les surfaces claires): état hover des boutons et cartes, translation de `-0.125rem`.
- **Filet intérieur** (`box-shadow: inset 0 0 0 4px var(--color-platre), inset 0 0 0 5px rgb(40 34 27 / 0.55)`): cadre peint avec double trait décalé, utilisé sur les sections outremer.
- **Ombre de lettre** (`text-shadow: 0.055em 0.055em 0 var(--color-ocre)`): capitales peintes du héros et des plaques de catégorie.

### Named Rules
**The Hard-Offset Shadow Rule.** Les ombres sont des décalages pleins, sans flou. Elles rappellent une plaque émaillée clouée au mur, pas une carte Material levée.

**The No-Blur Rule.** Pas d'ombres diffuses, pas de backdrop-filter, pas de glassmorphism. La profondeur se lit au trait, pas au flou.

## Shapes

Les formes sont volontairement rigides et proches du carré. Le rayon par défaut est de 2 px (`rounded-sm`) ; le maximum du système est 4 px. Les bordures sont systématiquement de 2 px solides en encre. Les cadres peints utilisent un double filet intérieur.

### Named Rules
**The Almost-Square Rule.** Les coins sont presque droits (2–4 px). Une carte arrondie est une erreur dans ce monde.

**The Two-Pixel Ink Border Rule.** Une bordure visible est toujours 2 px solide en encre. Pas de bordures fantômes, pas de séparateurs de 1 px gris.

## Components

### Buttons
- **Shape:** coins presque carrés (`rounded-sm`, 2 px), bordure 2 px encre.
- **Primary:** fond garance, texte plâtre, padding `16px 32px`, uppercase, tracking large. Au repos : `relief` (4 px). Hover : translation `-0.125rem`, ombre 6 px, fond garance-foncé.
- **Secondary:** fond plâtre, texte encre, même bordure et ombre. Hover : fond platre-foncé, ombre 6 px plus douce.
- **Ghost:** fond transparent, bordure encre, texte encre. Utilisé pour "Tout voir →" et les liens discrets.

### Cards / Containers
- **Corner Style:** `rounded-sm` (2 px), bordure 2 px encre.
- **Background:** `#fbf7ec` (craie) pour les cartes d'annonce ; plâtre ou outremer pour les blocs de section.
- **Shadow Strategy:** `relief-doux` au repos ; `relief` ou 6 px au hover.
- **Internal Padding:** `16px` ( corps de carte), `24px` pour les blocs de section.
- **Signature element:** plaque de catégorie peinte en haut de chaque carte, avec ombre-lettre et plaque départementale.

### Inputs / Fields
- **Style:** fond `#fbf7ec`, bordure 2 px encre, coins 2 px, padding `10px 14px`, taille `0.9rem`.
- **Focus:** bordure outremer, ombre décalée `3px 3px 0 0 rgb(30 63 140 / 0.35)`.
- **Label:** `libelle` — petites capitales, 0.75 rem, lettres espacées, couleur encre.
- **Error / Success:** bordure garance ou verdigris avec fond à 10 % d'opacité.

### Navigation
- **Header:** sticky, fond plâtre, bordure inférieure 2 px encre, hauteur 64 px.
- **Links desktop:** `etiquette`, encre au repos, garance au hover.
- **CTA header:** bouton primaire compact (`px-4 py-2`).
- **Mobile:** menu raccourci avec deux liens et un CTA compact.

### Plaque de département
- **Shape:** rectangle ocre, bordure 2 px encre, coins 2 px, padding serré.
- **Typography:** Chivo extrabold, 0.68 rem, lettres espacées, texte encre.
- **Use:** identifiant géographique partout : cartes, filtres, fiches, frise animée.

### Médaillon de marque (MarqueFF)
- **Shape:** cercle émaillé outremer, bordure 2 px encre, filet intérieur plâtre.
- **Iconography:** fourchette et fourche croisées, traits blancs, dessinés à la main en SVG.
- **Use:** seul "logo" du projet, en header et footer.

## Do's and Don'ts

### Do:
- **Do** utiliser Caprasimo en capitales pour tout titre important, avec ombre-lettre ocre ou encre.
- **Do** garder les coins à 2–4 px et les bordures à 2 px solides en encre.
- **Do** utiliser garance pour les CTAs et les prix, outremer pour la marque et la carte, ocre pour les repères départementaux.
- **Do** préférer les ombres-relief décalées (4–6 px, sans flou) pour suggérer des plaques.
- **Do** utiliser les pictogrammes SVG dessinés à la main dans `src/components/icones.tsx`.
- **Do** laisser le plâtre visible comme fond de page ; les blocs doivent ressembler à des panneaux posés sur un mur.

### Don't:
- **Don't** utiliser de photos réelles, de logos stock ou d'assets de marque générés.
- **Don't** centrer un héro sur gradient ou utiliser des cartes arrondies décoratives.
- **Don't** utiliser d'emojis décoratifs en dehors des marqueurs de carte Leaflet.
- **Don't** adoucir les ombres avec du blur ou du backdrop-filter.
- **Don't** mélanger les encres de catégorie : chaque famille de produits a sa couleur fixe.
