import type { Category, Listing, User } from "@prisma/client";
import type { AnnonceAvecProducteur, ProducteurAvecAnnonces } from "./types";

// ============================================================
// DONNÉES DE DÉMONSTRATION — utilisées tant que la base de
// données n'est pas branchée. Remplacées automatiquement par
// les vraies données dès que DATABASE_URL est configurée.
// ============================================================

const MAINTENANT = new Date("2026-08-01T10:00:00Z");

function producteur(
  p: Pick<User, "id" | "displayName" | "bio" | "city" | "postalCode" | "departement" | "region" | "lat" | "lng" | "certifications"> & { email?: string },
): User {
  return {
    email: `${p.id}@demo.fourchette-fourche.fr`,
    role: "PRODUCTEUR",
    phone: "06 00 00 00 00",
    avatarUrl: null,
    siret: null,
    tvaIntracom: null,
    address: null,
    isVerified: true,
    emailNotifications: true,
    stripeAccountId: null,
    stripeOnboardingComplete: false,
    createdAt: MAINTENANT,
    updatedAt: MAINTENANT,
    ...p,
  };
}

function annonce(
  a: Pick<Listing, "id" | "producerId" | "title" | "description" | "category" | "priceCents" | "unit" | "quantityAvailable"> &
    Partial<Pick<Listing, "certifications">>,
): Listing {
  const prod = PRODUCTEURS.find((p) => p.id === a.producerId)!;
  return {
    photos: [],
    quantitySold: 0,
    tvaCents: 550,
    address: null,
    isActive: true,
    createdAt: MAINTENANT,
    updatedAt: MAINTENANT,
    certifications: [],
    ...a,
    city: prod.city,
    departement: prod.departement!,
    region: prod.region!,
    lat: prod.lat!,
    lng: prod.lng!,
  };
}

// ---------- Les 8 producteurs de démonstration ----------

export const PRODUCTEURS: User[] = [
  producteur({
    id: "prod-ferme-lilas",
    displayName: "Ferme des Lilas",
    bio: "Maraîchage bio depuis 15 ans au bord de la Loire. 40 variétés de légumes de saison, récoltés le matin même.",
    city: "Sainte-Luce-sur-Loire",
    postalCode: "44980",
    departement: "44",
    region: "52",
    lat: 47.26,
    lng: -1.48,
    certifications: ["BIO"],
  }),
  producteur({
    id: "prod-chevrerie-bocage",
    displayName: "La Chèvrerie du Bocage",
    bio: "Élevage de chèvres alpines en plein air et fromages affinés sur paille, au cœur du bocage normand.",
    city: "Mortain",
    postalCode: "50140",
    departement: "50",
    region: "28",
    lat: 48.65,
    lng: -0.94,
    certifications: ["BIO"],
  }),
  producteur({
    id: "prod-vergers-vallee",
    displayName: "Vergers de la Vallée",
    bio: "Fruits à noyau et pommes cultivés en agriculture raisonnée dans la vallée du Rhône. Abricots, pêches, pommes, poires.",
    city: "Valence",
    postalCode: "26000",
    departement: "26",
    region: "84",
    lat: 44.93,
    lng: 4.89,
    certifications: ["HVE"],
  }),
  producteur({
    id: "prod-ferme-aubrac",
    displayName: "Ferme Aubrac Tradition",
    bio: "Élevage de vaches Aubrac en pâturage extensif et fromage de Laguiole fermier. La tradition du plateau depuis 4 générations.",
    city: "Laguiole",
    postalCode: "12210",
    departement: "12",
    region: "76",
    lat: 44.68,
    lng: 2.85,
    certifications: ["AOP", "LABEL_ROUGE"],
  }),
  producteur({
    id: "prod-miellerie-collines",
    displayName: "Miellerie des Collines",
    bio: "Apiculteur transhumant en Luberon. Miels de lavande, de garrigue et d'acacia, récoltés à la main.",
    city: "Apt",
    postalCode: "84400",
    departement: "84",
    region: "93",
    lat: 43.88,
    lng: 5.4,
    certifications: ["BIO"],
  }),
  producteur({
    id: "prod-maree-port",
    displayName: "Marée du Port",
    bio: "Pêche artisanale au port de La Turballe. Bar, lieu, moules de bouchot — selon la marée et la saison.",
    city: "La Turballe",
    postalCode: "44420",
    departement: "44",
    region: "52",
    lat: 47.35,
    lng: -2.51,
    certifications: [],
  }),
  producteur({
    id: "prod-domaine-coteaux",
    displayName: "Domaine des Côteaux",
    bio: "Vignoble familial de 12 hectares en Saint-Émilion Grand Cru. Vins élevés en fût de chêne, en conversion bio.",
    city: "Saint-Émilion",
    postalCode: "33330",
    departement: "33",
    region: "75",
    lat: 44.89,
    lng: -0.16,
    certifications: ["HVE"],
  }),
  producteur({
    id: "prod-ferme-antan",
    displayName: "La Ferme d'Antan",
    bio: "Vaches normandes, poules plein air et camembert au lait cru moulé à la louche, comme autrefois.",
    city: "Honfleur",
    postalCode: "14600",
    departement: "14",
    region: "28",
    lat: 49.42,
    lng: 0.23,
    certifications: ["AOP"],
  }),
];

// ---------- Les 16 annonces de démonstration ----------

const LISTES_ANNONCES: Listing[] = [
  annonce({
    id: "ann-tomates-anciennes",
    producerId: "prod-ferme-lilas",
    title: "Tomates anciennes mélangées",
    description: "Cœur de bœuf, ananas, noire de Crimée… Récolte du matin, idéales pour salades et tartares. Disponibles jusqu'à fin septembre.",
    category: "LEGUMES",
    priceCents: 350,
    unit: "KG",
    quantityAvailable: 80,
    certifications: ["BIO"],
  }),
  annonce({
    id: "ann-carottes",
    producerId: "prod-ferme-lilas",
    title: "Carottes en botte (avec fanes)",
    description: "Carottes primeurs sucrées, vendues en bottes de 10. Les fanes font le bonheur des cuisiniers pour les pestos !",
    category: "LEGUMES",
    priceCents: 150,
    unit: "BOTTE",
    quantityAvailable: 120,
    certifications: ["BIO"],
  }),
  annonce({
    id: "ann-pommes-de-terre",
    producerId: "prod-ferme-lilas",
    title: "Pommes de terre Agata",
    description: "Chair fondante, parfaites pour purées et frites maison. Vente par sac de 5 kg possible (nous consulter).",
    category: "LEGUMES",
    priceCents: 90,
    unit: "KG",
    quantityAvailable: 500,
  }),
  annonce({
    id: "ann-chevre-frais",
    producerId: "prod-chevrerie-bocage",
    title: "Chèvre frais du jour",
    description: "Faisselle de chèvre crémeuse, moulée chaque matin. Se tient 10 jours au frais. Parfait nature, au miel ou en crottin chaud.",
    category: "FROMAGE",
    priceCents: 450,
    unit: "PIECE",
    quantityAvailable: 200,
    certifications: ["BIO"],
  }),
  annonce({
    id: "ann-tomme-chevre",
    producerId: "prod-chevrerie-bocage",
    title: "Tomme de chèvre affinée 3 mois",
    description: "Affinage sur planche d'épicéa dans notre cave. Pâte ferme, goût de noisette. Vente à la meule (~1,8 kg) ou au poids.",
    category: "FROMAGE",
    priceCents: 2200,
    unit: "KG",
    quantityAvailable: 30,
    certifications: ["BIO"],
  }),
  annonce({
    id: "ann-abricots",
    producerId: "prod-vergers-vallee",
    title: "Abricots Bergeron",
    description: "La star de l'été ! Chair orange parfumée, idéale pour confitures, tartes et coulis. Cagettes de 5 kg.",
    category: "FRUITS",
    priceCents: 420,
    unit: "KG",
    quantityAvailable: 300,
  }),
  annonce({
    id: "ann-pommes-gala",
    producerId: "prod-vergers-vallee",
    title: "Pommes Gala",
    description: "Croquantes et sucrées, calibre moyen. Conservation 3 mois en chambre froide. Idéales pour compotes et tartes tatin.",
    category: "FRUITS",
    priceCents: 210,
    unit: "KG",
    quantityAvailable: 800,
  }),
  annonce({
    id: "ann-cote-de-boeuf",
    producerId: "prod-ferme-aubrac",
    title: "Côte de bœuf Aubrac (race pure)",
    description: "Viande persillée et fondante, maturée 3 semaines. Race Aubrac élevée à l'herbe toute l'année. Pièces de 1 à 1,5 kg.",
    category: "VIANDE",
    priceCents: 1850,
    unit: "KG",
    quantityAvailable: 60,
    certifications: ["LABEL_ROUGE"],
  }),
  annonce({
    id: "ann-laguiole",
    producerId: "prod-ferme-aubrac",
    title: "Fromage de Laguiole AOP fermier",
    description: "Au lait cru et entier de nos vaches Aubrac. Affiné 4 à 8 mois. Vente en meule (~5 kg) ou quart de meule.",
    category: "FROMAGE",
    priceCents: 2400,
    unit: "KG",
    quantityAvailable: 40,
    certifications: ["AOP"],
  }),
  annonce({
    id: "ann-miel-lavande",
    producerId: "prod-miellerie-collines",
    title: "Miel de lavande du Luberon",
    description: "Récolte juillet 2026. Crémeux, floral, un goût incomparable. Pot de 500 g. Parfait pour fromages et marinades.",
    category: "MIEL",
    priceCents: 980,
    unit: "PIECE",
    quantityAvailable: 150,
    certifications: ["BIO"],
  }),
  annonce({
    id: "ann-bar-de-ligne",
    producerId: "prod-maree-port",
    title: "Bar de ligne (selon arrivage)",
    description: "Pêché à la ligne au large de Belle-Île. Poisson entier, vidé sur demande. Prévoir 300 à 400 g par personne.",
    category: "POISSON",
    priceCents: 2400,
    unit: "KG",
    quantityAvailable: 25,
  }),
  annonce({
    id: "ann-moules-bouchot",
    producerId: "prod-maree-port",
    title: "Moules de bouchot",
    description: "Bouchots de la baie du Mont-Saint-Michel. Petites mais charnues et iodées. Livraison le jeudi pour le week-end.",
    category: "FRUITS_DE_MER",
    priceCents: 320,
    unit: "KG",
    quantityAvailable: 400,
  }),
  annonce({
    id: "ann-saint-emilion",
    producerId: "prod-domaine-coteaux",
    title: "Saint-Émilion Grand Cru 2021",
    description: "85 % Merlot, 15 % Cabernet Franc. Élevé 14 mois en fût. Notes de fruits noirs et d'épices. Vente par carton de 6.",
    category: "VIN",
    priceCents: 1450,
    unit: "BOUTEILLE",
    quantityAvailable: 600,
    certifications: ["HVE"],
  }),
  annonce({
    id: "ann-camembert",
    producerId: "prod-ferme-antan",
    title: "Camembert de Normandie AOP au lait cru",
    description: "Moulé à la louche, affiné 3 semaines minimum. Crémeux à cœur quand il est à point. Livraison en caisse isotherme.",
    category: "FROMAGE",
    priceCents: 380,
    unit: "PIECE",
    quantityAvailable: 300,
    certifications: ["AOP"],
  }),
  annonce({
    id: "ann-oeufs-plein-air",
    producerId: "prod-ferme-antan",
    title: "Œufs plein air (code 1)",
    description: "Poules élevées en liberté dans les vergers. Coquille solide, jaune bien orange. Vente à la douzaine, consigne possible.",
    category: "OEUFS",
    priceCents: 320,
    unit: "DOUZAINE",
    quantityAvailable: 500,
  }),
  annonce({
    id: "ann-creme-crue",
    producerId: "prod-ferme-antan",
    title: "Crème crue épaisse",
    description: "Crème fleurette crue, épaissie naturellement 24 h. Sublime pour les sauces et les desserts. Pot de 50 cl.",
    category: "PRODUITS_LAITIERS",
    priceCents: 390,
    unit: "PIECE",
    quantityAvailable: 80,
  }),
];

// ---------- Assemblage annonces + producteurs ----------

export const ANNONCES_DEMO: AnnonceAvecProducteur[] = LISTES_ANNONCES.map(
  (a) => ({
    ...a,
    producer: (({ id, displayName, city, departement, region, certifications, bio, avatarUrl, stripeAccountId, stripeOnboardingComplete }) => ({
      id, displayName, city, departement, region, certifications, bio, avatarUrl, stripeAccountId, stripeOnboardingComplete,
    }))(PRODUCTEURS.find((p) => p.id === a.producerId)!),
  }),
);

export const PRODUCTEURS_DEMO: ProducteurAvecAnnonces[] = PRODUCTEURS.map(
  (p) => ({
    ...p,
    listings: LISTES_ANNONCES.filter((a) => a.producerId === p.id),
  }),
);
