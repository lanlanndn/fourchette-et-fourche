// Générateur PDF/A-3 avec facture Factur-X intégrée (pdf-lib).
// Profil BASIC WL : XMP + OutputIntent sRGB + pièce jointe "factur-x.xml" (AFRelationship Data).
import {
  PDFDocument,
  PDFName,
  StandardFonts,
  rgb,
  AFRelationship,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import type { PayloadFacture } from "./types";
import { LIBELLES_FACTURES } from "./constantes";

// ---------- Palette « Enseigne peinte » ----------

function hexVersRgb(hex: string): RGB {
  const v = hex.replace("#", "");
  return rgb(
    parseInt(v.slice(0, 2), 16) / 255,
    parseInt(v.slice(2, 4), 16) / 255,
    parseInt(v.slice(4, 6), 16) / 255,
  );
}

const PALETTE = {
  platre: hexVersRgb("#F1EADA"),
  craie: hexVersRgb("#FBF7EC"),
  platreFonce: hexVersRgb("#E3D7BC"),
  encre: hexVersRgb("#28221B"),
  encreDoux: hexVersRgb("#6B5F4E"),
  garance: hexVersRgb("#B93A1D"),
  ocre: hexVersRgb("#DDA92C"),
  outremer: hexVersRgb("#1E3F8C"),
  verdigris: hexVersRgb("#2F6B4F"),
};

const PAGE_LARGEUR = 595.28;
const PAGE_HAUTEUR = 841.89;
const MARGE = 48;

// ---------- Helpers d'affichage ----------

/** Montant en centimes → "7,00 €". */
function afficherMontant(centimes: number): string {
  return `${(centimes / 100).toFixed(2).replace(".", ",")} €`;
}

/** Taux en centièmes de point → "5,5 %". */
function afficherTaux(tauxBp: number): string {
  return `${String(tauxBp / 100).replace(".", ",")} %`;
}

/** Date longue française (fuseau Europe/Paris). */
function afficherDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "long",
  }).format(date);
}

/** Largeur d'un texte avec une police donnée. */
function largeur(font: PDFFont, texte: string, taille: number): number {
  return font.widthOfTextAtSize(texte, taille);
}

/** Tronque un texte avec "…" s'il dépasse la largeur max. */
function tronquer(
  font: PDFFont,
  texte: string,
  taille: number,
  largeurMax: number,
): string {
  if (largeur(font, texte, taille) <= largeurMax) return texte;
  let fin = texte.length;
  while (fin > 1 && largeur(font, `${texte.slice(0, fin)}…`, taille) > largeurMax) {
    fin -= 1;
  }
  return `${texte.slice(0, fin)}…`;
}

/** Dessine un texte aligné à droite. */
function texteADroite(
  page: PDFPage,
  font: PDFFont,
  texte: string,
  taille: number,
  xDroite: number,
  y: number,
  couleur: RGB,
) {
  page.drawText(texte, {
    x: xDroite - largeur(font, texte, taille),
    y,
    size: taille,
    font,
    color: couleur,
  });
}

/** Adresse complète sur une ligne ("12 rue des Lilas, 44000 Nantes" ou "—"). */
function adresseUneLigne(p: PayloadFacture["vendeur"]): string {
  const morceaux = [
    p.adresse && p.adresse !== "—" ? p.adresse : null,
    p.codePostal && p.codePostal !== "—" ? p.codePostal : null,
    p.ville && p.ville !== "—" ? p.ville : null,
  ].filter(Boolean);
  return morceaux.length > 0 ? morceaux.join(", ") : "—";
}

// ---------- XMP Factur-X (PDF/A-3) ----------

function construireXmp(p: PayloadFacture): string {
  return `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/" xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#" xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#">
      <pdfaExtension:schemas>
        <rdf:Bag>
          <rdf:li rdf:parseType="Resource">
            <pdfaSchema:schema>Factur-X PDFA Extension Schema</pdfaSchema:schema>
            <pdfaSchema:namespaceURI>urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#</pdfaSchema:namespaceURI>
            <pdfaSchema:prefix>fx</pdfaSchema:prefix>
            <pdfaSchema:property>
              <rdf:Seq>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>DocumentFileName</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>name of the embedded XML invoice file</pdfaProperty:description>
                </rdf:li>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>DocumentType</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>INVOICE</pdfaProperty:description>
                </rdf:li>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>Version</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>The actual version of the Factur-X schema</pdfaProperty:description>
                </rdf:li>
              </rdf:Seq>
            </pdfaSchema:property>
          </rdf:li>
        </rdf:Bag>
      </pdfaExtension:schemas>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#">
      <fx:DocumentType>INVOICE</fx:DocumentType>
      <fx:DocumentFileName>factur-x.xml</fx:DocumentFileName>
      <fx:Version>1.0</fx:Version>
      <fx:ConformanceLevel>BASIC WL</fx:ConformanceLevel>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/" xmlns:pdfx="http://ns.adobe.com/pdfx/1.3/" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
      <pdfx:Factur-X_1.0_Profile>BASIC WL</pdfx:Factur-X_1.0_Profile>
      <xmp:CreatorTool>Fourchette &amp; Fourche</xmp:CreatorTool>
      <xmp:CreateDate>${p.dateEmission.toISOString()}</xmp:CreateDate>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

// ---------- Construction du document ----------

/**
 * Construit le PDF/A-3 d'une facture avec le XML Factur-X en pièce jointe.
 * Retourne les octets du PDF (Uint8Array).
 */
export async function construirePdfFacturX(
  p: PayloadFacture,
  xml: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(p.numero);
  doc.setAuthor(p.vendeur.nom);
  doc.setSubject(`${LIBELLES_FACTURES[p.type]} ${p.numero}`);
  doc.setCreator("Fourchette & Fourche");
  doc.setProducer("Fourchette & Fourche");
  doc.setCreationDate(p.dateEmission);
  doc.setModificationDate(p.dateEmission);
  doc.setLanguage("fr-FR");

  // 1) Métadonnées XMP PDF/A-3 + profil Factur-X (pdf-lib n'a pas d'API XMP :
  //    on injecte le flux Metadata nous-mêmes dans le catalog).
  const xmpRef = doc.context.register(
    doc.context.stream(construireXmp(p), {
      Type: PDFName.of("Metadata"),
      Subtype: PDFName.of("XML"),
    }),
  );
  doc.catalog.set(PDFName.of("Metadata"), xmpRef);

  // 2) OutputIntent sRGB (identifiant enregistré ICC — pas d'incrustation requise).
  const outputIntentRef = doc.context.register(
    doc.context.obj({
      Type: "OutputIntent",
      S: "GTS_PDFA1",
      OutputConditionIdentifier: "sRGB IEC61966-2.1",
      RegistryName: "http://www.color.org",
      Info: "sRGB IEC61966-2.1",
    }),
  );
  doc.catalog.set(
    PDFName.of("OutputIntents"),
    doc.context.register(doc.context.obj([outputIntentRef])),
  );

  // 3) Pièce jointe factur-x.xml — AFRelationship Data exigé par le profil BASIC WL.
  await doc.attach(xml, "factur-x.xml", {
    mimeType: "application/xml",
    description: "Factur-X invoice",
    afRelationship: AFRelationship.Data,
  });

  // 4) Polices standard (autorisées sans incrustation en PDF/A-3) + page A4.
  const normal = await doc.embedFont(StandardFonts.Helvetica);
  const gras = await doc.embedFont(StandardFonts.HelveticaBold);
  const italique = await doc.embedFont(StandardFonts.HelveticaOblique);
  const page = doc.addPage([PAGE_LARGEUR, PAGE_HAUTEUR]);

  const encre = PALETTE.encre;
  const encreDoux = PALETTE.encreDoux;

  // ---------- Bandeau supérieur ----------
  const bandeauHaut = PAGE_HAUTEUR - MARGE;
  const bandeauBas = PAGE_HAUTEUR - 155;
  page.drawRectangle({
    x: 0,
    y: bandeauBas,
    width: PAGE_LARGEUR,
    height: bandeauHaut - bandeauBas,
    color: encre,
  });
  const estVente = p.type === "VENTE";
  const titreBandeau = estVente ? p.vendeur.nom : "FOURCHETTE & FOURCHE";
  page.drawText(tronquer(gras, titreBandeau, 18, PAGE_LARGEUR - 2 * MARGE), {
    x: MARGE,
    y: bandeauHaut - 34,
    size: 18,
    font: gras,
    color: PALETTE.platre,
  });
  const sousTitre = estVente
    ? `Producteur — facture éditée par Fourchette & Fourche`
    : "Plateforme de vente directe entre restaurateurs et producteurs";
  page.drawText(tronquer(normal, sousTitre, 10, PAGE_LARGEUR - 2 * MARGE), {
    x: MARGE,
    y: bandeauHaut - 52,
    size: 10,
    font: normal,
    color: PALETTE.platreFonce,
  });
  // Filet ocre sous le bandeau
  page.drawRectangle({
    x: MARGE,
    y: bandeauBas - 7,
    width: PAGE_LARGEUR - 2 * MARGE,
    height: 3,
    color: PALETTE.ocre,
  });

  // ---------- En-tête du document ----------
  let y = bandeauBas - 42;
  texteADroite(page, gras, LIBELLES_FACTURES[p.type], 13, PAGE_LARGEUR - MARGE, y, PALETTE.garance);
  y -= 20;
  texteADroite(page, normal, `N° ${p.numero}`, 11, PAGE_LARGEUR - MARGE, y, encre);
  y -= 17;
  texteADroite(
    page,
    normal,
    `Date d'émission : ${afficherDate(p.dateEmission)}`,
    10,
    PAGE_LARGEUR - MARGE,
    y,
    encreDoux,
  );
  if (p.estPayee) {
    y -= 20;
    const textePaye = "PAYÉE";
    const largeurPaye = largeur(gras, textePaye, 10) + 14;
    page.drawRectangle({
      x: PAGE_LARGEUR - MARGE - largeurPaye,
      y: y - 4,
      width: largeurPaye,
      height: 16,
      color: PALETTE.verdigris,
    });
    texteADroite(page, gras, textePaye, 10, PAGE_LARGEUR - MARGE - 7, y + 1, PALETTE.platre);
  }
  if (p.mentionAutofacturation) {
    y -= 30;
    texteADroite(
      page,
      italique,
      "Document édité par Fourchette & Fourche au nom du vendeur (autofacturation).",
      8.5,
      PAGE_LARGEUR - MARGE,
      y,
      encreDoux,
    );
  }

  // ---------- Blocs Vendeur / Acheteur ----------
  const yBlocs = Math.min(y, bandeauBas - 42) - 62;
  const colonneDroite = MARGE + (PAGE_LARGEUR - 2 * MARGE) / 2;

  const dessinerBloc = (label: string, partie: PayloadFacture["vendeur"], x: number, yBloc: number) => {
    page.drawText(label, { x, y: yBloc, size: 8.5, font: gras, color: encreDoux });
    page.drawText(
      tronquer(gras, partie.nom, 11, PAGE_LARGEUR / 2 - 60),
      { x, y: yBloc - 16, size: 11, font: gras, color: encre },
    );
    let ligne = yBloc - 31;
    if (partie.siret) {
      page.drawText(`SIRET : ${partie.siret}`, { x, y: ligne, size: 9, font: normal, color: encreDoux });
      ligne -= 14;
    }
    if (partie.tvaIntracom) {
      page.drawText(`TVA intracom : ${partie.tvaIntracom}`, { x, y: ligne, size: 9, font: normal, color: encreDoux });
      ligne -= 14;
    }
    page.drawText(tronquer(normal, adresseUneLigne(partie), 9, PAGE_LARGEUR / 2 - 60), {
      x,
      y: ligne,
      size: 9,
      font: normal,
      color: encreDoux,
    });
    return ligne - 24;
  };

  let yApresBlocs = dessinerBloc("VENDEUR", p.vendeur, MARGE, yBlocs);
  yApresBlocs = dessinerBloc("ACHETEUR", p.acheteur, colonneDroite, yBlocs);

  // ---------- Tableau des lignes ----------
  const colDes = MARGE;
  const colQte = 252;
  const colPu = 308;
  const colTva = 370;
  const colTtc = 412;
  const colFin = PAGE_LARGEUR - MARGE;
  const hauteurEnTete = 22;
  const hauteurLigne = 24;

  const yEnTete = yApresBlocs - 18;
  page.drawRectangle({
    x: colDes,
    y: yEnTete - hauteurEnTete,
    width: colFin - colDes,
    height: hauteurEnTete,
    color: PALETTE.platreFonce,
  });
  const dessinerEnTete = (texte: string, x: number, aligneDroite = false) => {
    if (aligneDroite) {
      texteADroite(page, gras, texte, 9, x, yEnTete - 14, encre);
    } else {
      page.drawText(texte, { x, y: yEnTete - 14, size: 9, font: gras, color: encre });
    }
  };
  dessinerEnTete("Désignation", colDes + 6);
  dessinerEnTete("Quantité", colQte, true);
  dessinerEnTete("PU HT", colPu, true);
  dessinerEnTete("TVA", colTva, true);
  dessinerEnTete("Montant TTC", colFin - 6, true);

  let yLigne = yEnTete - hauteurEnTete;
  for (const ligne of p.lignes) {
    yLigne -= hauteurLigne;
    // Désignation (tronquée à la largeur de la colonne)
    page.drawText(
      tronquer(normal, ligne.nom, 9.5, colQte - colDes - 12),
      { x: colDes + 6, y: yLigne + 8, size: 9.5, font: normal, color: encre },
    );
    texteADroite(
      page,
      normal,
      `${String(ligne.quantite)}${ligne.uniteLibelle ? ` ${ligne.uniteLibelle}` : ""}`,
      9.5,
      colPu - 6,
      yLigne + 8,
      encre,
    );
    texteADroite(page, normal, afficherMontant(Math.round(ligne.montantHtCents / ligne.quantite)), 9.5, colTva - 6, yLigne + 8, encre);
    texteADroite(page, normal, afficherTaux(ligne.tauxTvaBp), 9.5, colTtc - 6, yLigne + 8, encre);
    texteADroite(page, gras, afficherMontant(ligne.montantTtcCents), 9.5, colFin - 6, yLigne + 8, PALETTE.garance);
    // Filet de séparation
    page.drawLine({
      start: { x: colDes, y: yLigne + 3 },
      end: { x: colFin, y: yLigne + 3 },
      thickness: 0.6,
      color: PALETTE.platreFonce,
    });
  }
  // Cadre du tableau
  page.drawRectangle({
    x: colDes,
    y: yLigne + 3,
    width: colFin - colDes,
    height: yEnTete - yLigne - 3,
    borderColor: encre,
    borderWidth: 1.2,
  });

  // ---------- Ventilation TVA ----------
  let yVent = yLigne - 26;
  for (const v of p.ventilation) {
    page.drawText(
      `Base HT ${afficherTaux(v.tauxBp)} : ${afficherMontant(v.baseHtCents)} — TVA : ${afficherMontant(v.tvaCents)}`,
      { x: MARGE, y: yVent, size: 9, font: normal, color: encreDoux },
    );
    yVent -= 14;
  }

  // ---------- Totaux ----------
  const yTotaux = yVent - 18;
  const xTotaux = colPu;
  const ligneTotal = (label: string, valeur: string, taille: number, fontTexte: PDFFont, couleur: RGB) => {
    page.drawText(label, { x: xTotaux, y: yTotaux, size: taille, font: fontTexte, color: couleur });
    texteADroite(page, fontTexte, valeur, taille, colFin, yTotaux, couleur);
  };
  let yT = yTotaux;
  ligneTotal("Total HT", afficherMontant(p.totalHtCents), 10, normal, encre);
  yT -= 18;
  ligneTotal("Total TVA", afficherMontant(p.totalTvaCents), 10, normal, encre);
  yT -= 24;
  ligneTotal("TOTAL TTC", afficherMontant(p.totalTtcCents), 13, gras, PALETTE.garance);
  page.drawLine({
    start: { x: xTotaux, y: yT - 6 },
    end: { x: colFin, y: yT - 6 },
    thickness: 2,
    color: PALETTE.garance,
  });

  // ---------- Informations de paiement ----------
  let yPaiement = yT - 30;
  if (p.estPayee) {
    page.drawText(
      `Payée le ${afficherDate(p.dateEmission)} — carte bancaire (Stripe)`,
      { x: MARGE, y: yPaiement, size: 9, font: normal, color: PALETTE.verdigris },
    );
    yPaiement -= 14;
  }
  page.drawText(`Référence commande : ${p.referenceCommande}`, {
    x: MARGE,
    y: yPaiement,
    size: 9,
    font: normal,
    color: encreDoux,
  });
  if (p.referencePaiement) {
    yPaiement -= 14;
    page.drawText(`Référence paiement : ${p.referencePaiement}`, {
      x: MARGE,
      y: yPaiement,
      size: 9,
      font: normal,
      color: encreDoux,
    });
  }

  // ---------- Pied de page ----------
  const societe = p.vendeur;
  const siretTexte = societe.siret ? `SIRET : ${societe.siret}` : "SIRET : à compléter";
  const tvaTexte = societe.tvaIntracom
    ? `TVA intracom : ${societe.tvaIntracom}`
    : "TVA intracom : à compléter";
  const pieds = [
    `${societe.nom} — ${siretTexte} — ${tvaTexte} — ${adresseUneLigne(societe)}`,
    "Facture générée automatiquement — valable sans signature.",
    `© ${p.annee} Fourchette & Fourche`,
  ];
  let yPied = 64;
  page.drawLine({
    start: { x: MARGE, y: yPied + 10 },
    end: { x: colFin, y: yPied + 10 },
    thickness: 1,
    color: PALETTE.platreFonce,
  });
  for (const texte of pieds) {
    page.drawText(tronquer(normal, texte, 8, colFin - MARGE), {
      x: MARGE,
      y: yPied,
      size: 8,
      font: normal,
      color: encreDoux,
    });
    yPied -= 11;
  }

  return doc.save();
}
