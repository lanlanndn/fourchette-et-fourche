// Générateur du XML CII Factur-X (profil BASIC WL, minimum requis en France).
// Structure conforme à la spécification Factur-X 1.07.x / EN 16931.
import type { PartieFacture, PayloadFacture } from "./types";

// ---------- Helpers ----------

/** Échappe les caractères réservés XML. */
function echapperXml(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Montant en centimes → chaîne en euros à 2 décimales, séparateur point ("6.64"). */
function centimesVersEuros(centimes: number): string {
  return (centimes / 100).toFixed(2);
}

/** Date → format 102 (AAAAMMJJ), fuseau Europe/Paris. */
function dateVers102(date: Date): string {
  const parties = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  return parties.split("/").reverse().join("");
}

/** Quantité → chaîne décimale sans zéros inutiles (2 → "2", 2.5 → "2.5"). */
function quantiteVersChaine(quantite: number): string {
  return String(quantite);
}

/** Taux en centièmes de point → pourcentage XML (550 → "5.5", 2000 → "20"). */
function tauxBpVersPourcent(tauxBp: number): string {
  return String(tauxBp / 100);
}

/** Catégorie de TVA EN 16931 : S = taux normal, Z = zéro (0 %). */
function categorieTva(tauxBp: number): string {
  return tauxBp === 0 ? "Z" : "S";
}

/** Bloc vendeur/acheteur (structure identique des deux côtés). */
function blocPartie(p: PartieFacture, role: "Seller" | "Buyer"): string {
  const balise = role === "Seller" ? "ram:SellerTradeParty" : "ram:BuyerTradeParty";
  // SIRET : BT-30 côté vendeur, BT-46 côté acheteur (omis si inconnu)
  const siret =
    p.siret
      ? `\n      <ram:SpecifiedLegalOrganization>\n        <ram:ID schemeID="0002">${echapperXml(p.siret)}</ram:ID>\n      </ram:SpecifiedLegalOrganization>`
      : "";
  const tva =
    p.tvaIntracom
      ? `\n      <ram:SpecifiedTaxRegistration>\n        <ram:ID schemeID="VA">${echapperXml(p.tvaIntracom)}</ram:ID>\n      </ram:SpecifiedTaxRegistration>`
      : "";

  return `      <${balise}>
        <ram:Name>${echapperXml(p.nom)}</ram:Name>${siret}
        <ram:PostalTradeAddress>
          <ram:PostcodeCode>${echapperXml(p.codePostal || "—")}</ram:PostcodeCode>
          <ram:LineOne>${echapperXml(p.adresse || "—")}</ram:LineOne>
          <ram:CityName>${echapperXml(p.ville || "—")}</ram:CityName>
          <ram:CountryID>${echapperXml(p.pays || "FR")}</ram:CountryID>
        </ram:PostalTradeAddress>${tva}
      </${balise}>`;
}

// ---------- Génération ----------

/**
 * Construit le XML CII Factur-X d'une facture.
 * Profil BASIC WL : urn:factur-x.eu:1p0:minimum.
 */
export function construireXmlFacturX(p: PayloadFacture): string {
  const lignesXml = p.lignes
    .map((ligne, i) => {
      // Prix unitaire HT (BT-146), arrondi au centime par unité
      const prixUnitaireHt = centimesVersEuros(
        Math.round(ligne.montantHtCents / ligne.quantite),
      );
      return `    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${i + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${echapperXml(ligne.nom)}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${prixUnitaireHt}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="${echapperXml(ligne.uniteCode)}">${quantiteVersChaine(ligne.quantite)}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>${categorieTva(ligne.tauxTvaBp)}</ram:CategoryCode>
          <ram:ApplicablePercent>${tauxBpVersPourcent(ligne.tauxTvaBp)}</ram:ApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementMonetarySummation>
          <ram:LineTotalAmount>${centimesVersEuros(ligne.montantHtCents)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`;
    })
    .join("\n");

  const ventilationXml = p.ventilation
    .map(
      (v) => `      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${centimesVersEuros(v.tvaCents)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${centimesVersEuros(v.baseHtCents)}</ram:BasisAmount>
        <ram:CategoryCode>${categorieTva(v.tauxBp)}</ram:CategoryCode>
        <ram:RateApplicablePercent>${tauxBpVersPourcent(v.tauxBp)}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>`,
    )
    .join("\n");

  const noteAutofacturation = p.mentionAutofacturation
    ? `    <ram:IncludedNote>
      <ram:Content>Facture établie par le client (autofacturation)</ram:Content>
    </ram:IncludedNote>
`
    : "";

  const referencePaiement = p.referencePaiement
    ? `      <ram:PaymentReference>${echapperXml(p.referencePaiement)}</ram:PaymentReference>\n`
    : "";

  const date = dateVers102(p.dateEmission);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:factur-x.eu:1p0:minimum</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
    <ram:BusinessProcessSpecifiedDocumentContextParameter>
      <ram:ID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</ram:ID>
    </ram:BusinessProcessSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${echapperXml(p.numero)}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${date}</udt:DateTimeString>
    </ram:IssueDateTime>
${noteAutofacturation}  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
${lignesXml}
    <ram:ApplicableHeaderTradeAgreement>
      <ram:BuyerReference>${echapperXml(p.referenceCommande)}</ram:BuyerReference>
${blocPartie(p.vendeur, "Seller")}
${blocPartie(p.acheteur, "Buyer")}
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery>
      <ram:ActualDeliverySupplyChainEvent>
        <ram:OccurrenceDateTime>
          <udt:DateTimeString format="102">${date}</udt:DateTimeString>
        </ram:OccurrenceDateTime>
      </ram:ActualDeliverySupplyChainEvent>
    </ram:ApplicableHeaderTradeDelivery>
    <ram:ApplicableHeaderTradeSettlement>
${referencePaiement}      <ram:InvoiceCurrencyCode>EUR</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementPaymentMeans>
        <ram:TypeCode>48</ram:TypeCode>
      </ram:SpecifiedTradeSettlementPaymentMeans>
      <ram:SpecifiedTradePaymentTerms>
        <ram:DueDateDateTime>
          <udt:DateTimeString format="102">${date}</udt:DateTimeString>
        </ram:DueDateDateTime>
      </ram:SpecifiedTradePaymentTerms>
${ventilationXml}
      <ram:SpecifiedTradeSettlementMonetarySummation>
        <ram:LineTotalAmount>${centimesVersEuros(p.totalHtCents)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${centimesVersEuros(p.totalHtCents)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount>${centimesVersEuros(p.totalTvaCents)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${centimesVersEuros(p.totalTtcCents)}</ram:GrandTotalAmount>
        <ram:TotalPrepaidAmount>${centimesVersEuros(p.totalTtcCents)}</ram:TotalPrepaidAmount>
        <ram:DuePayableAmount>0.00</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>
`;
}
