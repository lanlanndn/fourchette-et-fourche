// Client Mondial Relay « Connect » (API Dual Carrier) — création de bordereaux.
// Protocole : XML/SOAP envoyé en POST sur /api/shipment.
//   Sandbox : connect-api-sandbox.mondialrelay.com (identifiants de test)
//   Prod    : connect-api.mondialrelay.com (clés générées dans le portail Connect)
// Contrat établi d'après les intégrations publiques (gem deliveries, SDK smart-dato) :
// requête ShipmentCreationRequest (Context, OutputOptions PdfUrl 10x15, Shipment),
// réponse ShipmentNumber + LabelList/Label/Output (URL du PDF).
//
// Modes : DeliveryMode "HOC" = livraison à domicile (France),
// CollectionMode "REL" = dépôt du colis en point relais par l'expéditeur.
// Poids : Weight Value en grammes, Unit "gr".

export type AdresseExpedition = {
  nom: string; // société / nom complet
  ligne1: string; // rue + n°
  ligne2?: string | null; // complément d'adresse
  codePostal: string;
  ville: string;
  pays: string; // code ISO, ex : "FR"
  telephone?: string | null;
  email?: string | null;
};

export type ResultatBordereau = {
  numeroExpedition: string; // n° d'expédition = n° de suivi
  urlPdf: string; // URL du bordereau PDF (temporaire — on l'archive en bucket)
};

const URL_API =
  process.env.MONDIAL_RELAY_URL ??
  "https://connect-api-sandbox.mondialrelay.com/api/shipment";

/** Le client est-il configuré ? (identifiants du portail Mondial Relay) */
export function clientMondialRelayConfigure(): boolean {
  return Boolean(
    process.env.MONDIAL_RELAY_USER &&
      process.env.MONDIAL_RELAY_PASSWORD &&
      process.env.MONDIAL_RELAY_CUSTOMER_ID,
  );
}

function echapperXml(valeur: string): string {
  return valeur
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Bloc <Address> pour l'expéditeur ou le destinataire. */
function blocAdresse(a: AdresseExpedition): string {
  return `<Address>
        <Title />
        <Firstname />
        <Lastname>${echapperXml(a.nom)}</Lastname>
        <Streetname>${echapperXml(a.ligne1)}</Streetname>
        <HouseNo />
        <CountryCode>${echapperXml(a.pays)}</CountryCode>
        <PostCode>${echapperXml(a.codePostal)}</PostCode>
        <City>${echapperXml(a.ville)}</City>
        <AddressAdd1>${echapperXml(a.ligne2 ?? "")}</AddressAdd1>
        <AddressAdd2 />
        <AddressAdd3 />
        <PhoneNo>${echapperXml(a.telephone ?? "")}</PhoneNo>
        <MobileNo />
        <Email>${echapperXml(a.email ?? "")}</Email>
      </Address>`;
}

/**
 * Crée un bordereau d'envoi chez Mondial Relay.
 * Renvoie le n° d'expédition (suivi) et l'URL du PDF à archiver.
 */
export async function creerBordereau(params: {
  orderId: string;
  expediteur: AdresseExpedition;
  destinataire: AdresseExpedition;
  poidsGrammes: number;
}): Promise<ResultatBordereau> {
  const { orderId, expediteur, destinataire, poidsGrammes } = params;

  if (!clientMondialRelayConfigure()) {
    throw new Error("Mondial Relay non configuré (identifiants manquants).");
  }

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<ShipmentCreationRequest xmlns:xsi0="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="http://www.example.org/Request">
  <Context>
    <Login>${echapperXml(process.env.MONDIAL_RELAY_USER!)}</Login>
    <Password>${echapperXml(process.env.MONDIAL_RELAY_PASSWORD!)}</Password>
    <CustomerId>${echapperXml(process.env.MONDIAL_RELAY_CUSTOMER_ID!)}</CustomerId>
    <Culture>fr-FR</Culture>
    <VersionAPI>1.0</VersionAPI>
  </Context>
  <OutputOptions>
    <OutputFormat>10x15</OutputFormat>
    <OutputType>PdfUrl</OutputType>
  </OutputOptions>
  <ShipmentsList>
    <Shipment>
      <OrderNo>${echapperXml(orderId)}</OrderNo>
      <CustomerNo />
      <ParcelCount>1</ParcelCount>
      <DeliveryMode Mode="HOC" Location="" />
      <CollectionMode Mode="REL" Location="" />
      <Parcels>
        <Parcel>
          <Content>Produits alimentaires</Content>
          <Weight Value="${poidsGrammes}" Unit="gr" />
        </Parcel>
      </Parcels>
      <DeliveryInstruction />
      <Sender>${blocAdresse(expediteur)}</Sender>
      <Recipient>${blocAdresse(destinataire)}</Recipient>
    </Shipment>
  </ShipmentsList>
</ShipmentCreationRequest>`;

  let texte: string;
  try {
    const reponse = await fetch(URL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        Accept: "application/xml",
      },
      body: xml,
    });
    texte = await reponse.text();
    if (!reponse.ok) {
      throw new Error(`HTTP ${reponse.status} — ${texte.slice(0, 300)}`);
    }
  } catch (err) {
    // fetch échoue aussi si l'API est injoignable (NetworkError)
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Appel Mondial Relay impossible : ${msg}`);
  }

  // Erreur métier renvoyée dans le XML (Status Level = Critical Error / Error)
  const statutErreur = /<Status[^>]*Level="(?:Critical Error|Error)"[^>]*>/.exec(texte);
  if (statutErreur) {
    const message = /<Message>([^<]*)<\/Message>/.exec(texte)?.[1] ?? "Erreur inconnue";
    const code = /<Code>([^<]*)<\/Code>/.exec(texte)?.[1] ?? "?";
    throw new Error(`Mondial Relay ${code} : ${message}`);
  }

  const numeroExpedition =
    /ShipmentNumber="([^"]+)"/.exec(texte)?.[1] ??
    /<ShipmentNumber>([^<]+)<\/ShipmentNumber>/.exec(texte)?.[1];

  const urlPdf = /<Output>([^<]+)<\/Output>/.exec(texte)?.[1];

  if (!numeroExpedition || !urlPdf) {
    throw new Error(
      `Réponse Mondial Relay inattendue (${texte.slice(0, 300)})`,
    );
  }

  return { numeroExpedition, urlPdf };
}
