// Client Sendcloud (API v3) — création des bordereaux d'envoi.
// Sendcloud est la plateforme d'expédition : elle génère le bordereau du
// transporteur (Mondial Relay en v1) et renvoie le numéro de suivi.
//
// Auth : HTTP Basic (clé publique : clé secrète).
// Clés : panel Sendcloud → Settings → Integrations → « Sendcloud API » → Connect.
//
// Références : POST /api/v3/shipments/announce (création synchrone + étiquette)
// et POST /api/v3/shipping-options/return-a-list-of-available-shipping-options
// (liste des options activées sur le compte, avec leur `code`).

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
  numeroExpedition: string; // n° de suivi (tracking number)
  transporteur: string; // ex : "Mondial Relay"
  trackingUrl?: string | null;
  urlPdf?: string | null; // lien du document PDF (sinon pdfBase64)
  pdfBase64?: string | null; // PDF en base64 (label_file, colis unique)
};

const URL_API =
  process.env.SENDCLOUD_API_URL ?? "https://panel.sendcloud.sc/api/v3";

/** Le client est-il configuré ? (clés API du panel Sendcloud) */
export function clientSendcloudConfigure(): boolean {
  return Boolean(
    process.env.SENDCLOUD_PUBLIC_KEY && process.env.SENDCLOUD_SECRET_KEY,
  );
}

/** En-têtes HTTP avec l'authentification Basic (clé publique : clé secrète). */
export function entetesAuthSendcloud(): Record<string, string> {
  const token = Buffer.from(
    `${process.env.SENDCLOUD_PUBLIC_KEY}:${process.env.SENDCLOUD_SECRET_KEY}`,
  ).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

type OptionExpedition = {
  code: string;
  lastMile?: string | null; // "home_delivery", "service_point"…
  nom?: string;
};

/** Forme brute d'une option renvoyée par l'API (champs utiles uniquement). */
type OptionBrute = {
  code?: string;
  name?: string;
  functionalities?: { last_mile?: string | null } | null;
};

/** Erreur JSON:API renvoyée par Sendcloud. */
type ErreurSendcloud = {
  code?: string;
  title?: string;
  detail?: string;
};

/** Document d'un colis (étiquette PDF notamment). */
type DocumentColis = {
  document_type?: string;
  type?: string;
  link?: string;
} | null;

/** Réponse de l'annonce synchrone (champs utilisés uniquement). */
type ReponseAnnonce = {
  data?: ReponseAnnonce;
  errors?: ErreurSendcloud[];
  parcels?: Array<{
    tracking_number?: string | null;
    tracking_numbers?: string[];
    tracking_url?: string | null;
    label_file?: string | null;
    documents?: DocumentColis[];
  }>;
  carrier?: { name?: string };
};

/**
 * Liste les options d'expédition activées sur le compte Sendcloud pour un
 * trajet (expéditeur → destinataire), filtrées sur le transporteur choisi.
 */
export async function listerOptionsExpedition(params: {
  expediteur: AdresseExpedition;
  destinataire: AdresseExpedition;
}): Promise<OptionExpedition[]> {
  const { expediteur, destinataire } = params;
  const corps = {
    from_address: {
      country_code: expediteur.pays,
      postal_code: expediteur.codePostal,
      city: expediteur.ville,
    },
    to_address: {
      country_code: destinataire.pays,
      postal_code: destinataire.codePostal,
      city: destinataire.ville,
    },
    carrier_code: process.env.SENDCLOUD_CARRIER ?? "mondial_relay",
  };

  const reponse = await fetch(
    `${URL_API}/shipping-options/return-a-list-of-available-shipping-options`,
    {
      method: "POST",
      headers: entetesAuthSendcloud(),
      body: JSON.stringify(corps),
    },
  );
  const texte = await reponse.text();
  if (!reponse.ok) {
    throw new Error(
      `Options Sendcloud : HTTP ${reponse.status} — ${texte.slice(0, 300)}`,
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(texte);
  } catch {
    return [];
  }

  const liste: OptionBrute[] = Array.isArray(json)
    ? (json as OptionBrute[])
    : Array.isArray((json as { options?: OptionBrute[] }).options)
      ? (json as { options: OptionBrute[] }).options
      : [];

  return liste.map((o) => ({
    code: String(o.code ?? ""),
    lastMile: o.functionalities?.last_mile ?? null,
    nom: o.name ?? undefined,
  }));
}

/**
 * Crée le bordereau d'envoi chez Sendcloud (annonce synchrone du colis).
 * Renvoie le n° de suivi, le transporteur et le PDF (base64 ou lien).
 */
export async function creerBordereau(params: {
  orderId: string;
  expediteur: AdresseExpedition;
  destinataire: AdresseExpedition;
  poidsGrammes: number;
}): Promise<ResultatBordereau> {
  const { orderId, expediteur, destinataire, poidsGrammes } = params;

  if (!clientSendcloudConfigure()) {
    throw new Error("Sendcloud non configuré (clés API manquantes).");
  }

  // 1) Choisir l'option d'expédition : env SENDCLOUD_SHIPPING_OPTION si
  //    fournie, sinon la première option « domicile » du transporteur.
  let codeOption = process.env.SENDCLOUD_SHIPPING_OPTION?.trim() || undefined;
  if (!codeOption) {
    const options = await listerOptionsExpedition({ expediteur, destinataire });
    const domicile = options.find((o) => o.lastMile === "home_delivery");
    codeOption = (domicile ?? options[0])?.code;
    if (!codeOption) {
      throw new Error(
        "Aucune option d'expédition disponible chez Sendcloud (transporteur activé sur le compte ?).",
      );
    }
  }

  // 2) Annoncer le colis (synchrones : étiquette immédiate pour 1 colis)
  const corps = {
    to_address: {
      name: destinataire.nom,
      address_line_1: destinataire.ligne1,
      address_line_2: destinataire.ligne2 ?? undefined,
      postal_code: destinataire.codePostal,
      city: destinataire.ville,
      country_code: destinataire.pays,
      phone_number: destinataire.telephone ?? undefined,
      email: destinataire.email ?? undefined,
    },
    from_address: {
      name: expediteur.nom,
      address_line_1: expediteur.ligne1,
      postal_code: expediteur.codePostal,
      city: expediteur.ville,
      country_code: expediteur.pays,
      phone_number: expediteur.telephone ?? undefined,
      email: expediteur.email ?? undefined,
    },
    ship_with: {
      type: "shipping_option_code",
      properties: { shipping_option_code: codeOption },
    },
    order_number: orderId,
    reference: `Commande ${orderId}`,
    external_reference_id: orderId,
    label_details: { mime_type: "application/pdf" },
    parcels: [
      {
        weight: { value: (poidsGrammes / 1000).toFixed(3), unit: "kg" },
      },
    ],
  };

  let texte: string;
  try {
    const reponse = await fetch(`${URL_API}/shipments/announce`, {
      method: "POST",
      headers: entetesAuthSendcloud(),
      body: JSON.stringify(corps),
    });
    texte = await reponse.text();
    if (!reponse.ok) {
      throw new Error(`HTTP ${reponse.status} — ${texte.slice(0, 300)}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Appel Sendcloud impossible : ${msg}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(texte);
  } catch {
    throw new Error(`Réponse Sendcloud illisible (${texte.slice(0, 300)})`);
  }
  const donnees: ReponseAnnonce = ((json as ReponseAnnonce).data ??
    json) as ReponseAnnonce;

  // Erreurs annoncées (le colis peut être créé mais non annoncé)
  const erreurs: ErreurSendcloud[] = donnees.errors ?? [];
  if (erreurs.length > 0) {
    const detail = erreurs
      .map((e) => `${e.code ?? "erreur"} : ${e.detail ?? e.title ?? "?"}`)
      .join(" | ");
    throw new Error(`Sendcloud : ${detail}`);
  }

  const colis = donnees.parcels?.[0];
  const numero =
    colis?.tracking_number ??
    (Array.isArray(colis?.tracking_numbers) ? colis.tracking_numbers[0] : null);

  if (!numero) {
    throw new Error(
      `Réponse Sendcloud sans numéro de suivi (${texte.slice(0, 300)})`,
    );
  }

  const documentLabel = Array.isArray(colis?.documents)
    ? colis.documents.find(
        (d) =>
          d?.document_type === "label" || d?.type === "label" || Boolean(d?.link),
      )
    : null;

  return {
    numeroExpedition: String(numero),
    transporteur: donnees?.carrier?.name ?? "Mondial Relay",
    trackingUrl: colis?.tracking_url ?? null,
    urlPdf: documentLabel?.link ?? null,
    pdfBase64: colis?.label_file ?? null,
  };
}
