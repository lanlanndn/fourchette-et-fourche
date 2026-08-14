import { echapperHtml, gabaritEmail, urlApp, formaterPrixEmail, extraitTexte } from "./gabarit";

// ---------- Types partagés ----------

interface ContenuEmail {
  subject: string;
  html: string;
  text: string;
}

// ---------- Confirmation acheteur ----------

export function emailConfirmationAcheteur(params: {
  displayName: string;
  titreProduit: string;
  quantite: number;
  unite: string;
  prixUnitaireCents: number;
  totalCents: number;
  orderId: string;
}): ContenuEmail {
  const contenu = `
    <p style="font-size:15px;margin:0 0 12px 0;line-height:1.5;">
      Bonjour ${echapperHtml(params.displayName)},
    </p>
    <p style="font-size:15px;margin:0 0 16px 0;line-height:1.5;">
      Votre commande est confirmée et votre paiement a bien été reçu.
    </p>
    <table cellpadding="8" cellspacing="0" border="0" width="100%" style="border:2px solid #28221b;border-collapse:collapse;margin-bottom:16px;">
      <tr style="background-color:#e3d7bc;">
        <td style="font-weight:700;font-size:14px;border-bottom:2px solid #28221b;">Produit</td>
        <td style="font-weight:700;font-size:14px;border-bottom:2px solid #28221b;text-align:center;">Quantité</td>
        <td style="font-weight:700;font-size:14px;border-bottom:2px solid #28221b;text-align:right;">Prix</td>
      </tr>
      <tr>
        <td style="font-size:14px;">${echapperHtml(params.titreProduit)}</td>
        <td style="font-size:14px;text-align:center;">${params.quantite} ${echapperHtml(params.unite.toLowerCase())}</td>
        <td style="font-size:14px;text-align:right;color:#b93a1d;font-weight:600;">${formaterPrixEmail(params.totalCents)}</td>
      </tr>
    </table>
    <p style="font-size:13px;color:#6b5f4e;margin:0 0 0 0;line-height:1.5;">
      Le producteur a été prévenu et vous répondra via la messagerie.
    </p>
  `;

  return {
    subject: "Votre commande est confirmée",
    ...gabaritEmail({
      titre: "Commande confirmée",
      contenu,
      cta: { texte: "Voir ma commande", url: urlApp(`/tableau-de-bord/commandes/${params.orderId}`) },
    }),
  };
}

// ---------- Nouvelle commande (producteur) ----------

export function emailNouvelleCommande(params: {
  displayName: string;
  acheteurNom: string;
  titreProduit: string;
  quantite: number;
  unite: string;
  totalCents: number;
  commissionCents: number;
  orderId: string;
}): ContenuEmail {
  const net = params.totalCents - params.commissionCents;

  const contenu = `
    <p style="font-size:15px;margin:0 0 12px 0;line-height:1.5;">
      Bonjour ${echapperHtml(params.displayName)},
    </p>
    <p style="font-size:15px;margin:0 0 16px 0;line-height:1.5;">
      Vous avez reçu une nouvelle commande de <strong>${echapperHtml(params.acheteurNom)}</strong>.
    </p>
    <table cellpadding="8" cellspacing="0" border="0" width="100%" style="border:2px solid #28221b;border-collapse:collapse;margin-bottom:16px;">
      <tr style="background-color:#e3d7bc;">
        <td style="font-weight:700;font-size:14px;border-bottom:2px solid #28221b;">Produit</td>
        <td style="font-weight:700;font-size:14px;border-bottom:2px solid #28221b;text-align:center;">Quantité</td>
        <td style="font-weight:700;font-size:14px;border-bottom:2px solid #28221b;text-align:right;">Prix</td>
      </tr>
      <tr>
        <td style="font-size:14px;">${echapperHtml(params.titreProduit)}</td>
        <td style="font-size:14px;text-align:center;">${params.quantite} ${echapperHtml(params.unite.toLowerCase())}</td>
        <td style="font-size:14px;text-align:right;color:#b93a1d;font-weight:600;">${formaterPrixEmail(params.totalCents)}</td>
      </tr>
      <tr>
        <td colspan="2" style="font-size:13px;color:#6b5f4e;text-align:right;">Commission plateforme (10 %)</td>
        <td style="font-size:13px;text-align:right;color:#6b5f4e;">−${formaterPrixEmail(params.commissionCents)}</td>
      </tr>
      <tr style="background-color:#e3d7bc;">
        <td colspan="2" style="font-weight:700;font-size:14px;text-align:right;border-top:2px solid #28221b;">Net perçu</td>
        <td style="font-weight:700;font-size:14px;text-align:right;color:#2f6b4f;border-top:2px solid #28221b;">${formaterPrixEmail(net)}</td>
      </tr>
    </table>
    <p style="font-size:13px;color:#6b5f4e;margin:0 0 0 0;line-height:1.5;">
      Vous pouvez répondre à l'acheteur via la messagerie.
    </p>
  `;

  return {
    subject: `Nouvelle commande — ${params.titreProduit}`,
    ...gabaritEmail({
      titre: "Nouvelle commande",
      contenu,
      cta: { texte: "Voir la commande", url: urlApp(`/tableau-de-bord/commandes/${params.orderId}`) },
    }),
  };
}

// ---------- Nouveau message ----------

export function emailNouveauMessage(params: {
  displayName: string;
  expediteurNom: string;
  titreProduit: string;
  contenuMessage: string;
  conversationId: string;
}): ContenuEmail {
  const extrait = extraitTexte(params.contenuMessage, 140);

  const contenu = `
    <p style="font-size:15px;margin:0 0 12px 0;line-height:1.5;">
      Bonjour ${echapperHtml(params.displayName)},
    </p>
    <p style="font-size:15px;margin:0 0 8px 0;line-height:1.5;">
      <strong>${echapperHtml(params.expediteurNom)}</strong> vous a écrit à propos de «&nbsp;${echapperHtml(params.titreProduit)}&nbsp;».
    </p>
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f1eada;border-left:3px solid #1e3f8c;margin:12px 0;">
      <tr>
        <td style="padding:12px 16px;font-size:14px;color:#28221b;line-height:1.5;font-style:italic;">
          « ${echapperHtml(extrait)} »
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `Nouveau message de ${params.expediteurNom}`,
    ...gabaritEmail({
      titre: "Nouveau message",
      contenu,
      cta: { texte: "Lire la conversation", url: urlApp(`/tableau-de-bord/messagerie/${params.conversationId}`) },
    }),
  };
}

// ---------- Paiement expiré ----------

export function emailPaiementExpire(params: {
  displayName: string;
  titreProduit: string;
}): ContenuEmail {
  const contenu = `
    <p style="font-size:15px;margin:0 0 12px 0;line-height:1.5;">
      Bonjour ${echapperHtml(params.displayName)},
    </p>
    <p style="font-size:15px;margin:0 0 16px 0;line-height:1.5;">
      Votre commande pour <strong>${echapperHtml(params.titreProduit)}</strong> a été annulée car le paiement n'a pas été finalisé dans le temps imparti.
    </p>
    <p style="font-size:14px;margin:0 0 0 0;line-height:1.5;color:#6b5f4e;">
      Aucun montant n'a été prélevé. Vous pouvez passer une nouvelle commande quand vous le souhaitez.
    </p>
  `;

  return {
    subject: `Commande annulée — ${params.titreProduit}`,
    ...gabaritEmail({
      titre: "Commande annulée",
      contenu,
      cta: { texte: "Voir les annonces", url: urlApp("/annonces") },
    }),
  };
}

// ---------- Onboarding Stripe terminé ----------

export function emailOnboardingTermine(params: {
  displayName: string;
}): ContenuEmail {
  const contenu = `
    <p style="font-size:15px;margin:0 0 12px 0;line-height:1.5;">
      Bonjour ${echapperHtml(params.displayName)},
    </p>
    <p style="font-size:15px;margin:0 0 12px 0;line-height:1.5;">
      Bonne nouvelle : vos paiements en ligne sont maintenant activés !
    </p>
    <p style="font-size:14px;margin:0 0 0 0;line-height:1.5;color:#6b5f4e;">
      Les restaurateurs peuvent désormais commander et payer directement sur vos annonces. Vous recevrez un email à chaque nouvelle commande.
    </p>
  `;

  return {
    subject: "Vos paiements en ligne sont activés",
    ...gabaritEmail({
      titre: "Paiements activés",
      contenu,
      cta: { texte: "Voir mes annonces", url: urlApp("/tableau-de-bord/annonces") },
    }),
  };
}

// ---------- Facture acheteur ----------

export function emailFactureAcheteur(params: {
  displayName: string;
  numeroFacture: string;
  totalCents: number;
  orderId: string;
}): ContenuEmail {
  const contenu = `
    <p style="font-size:15px;margin:0 0 12px 0;line-height:1.5;">
      Bonjour ${echapperHtml(params.displayName)},
    </p>
    <p style="font-size:15px;margin:0 0 16px 0;line-height:1.5;">
      Votre facture <strong>${echapperHtml(params.numeroFacture)}</strong> (${formaterPrixEmail(params.totalCents)}) est jointe à cet email, au format Factur-X.
    </p>
    <p style="font-size:14px;margin:0 0 0 0;line-height:1.5;color:#6b5f4e;">
      Vous la retrouverez aussi à tout moment dans votre espace, onglet «&nbsp;Mes factures&nbsp;».
    </p>
  `;

  return {
    subject: `Votre facture ${params.numeroFacture}`,
    ...gabaritEmail({
      titre: "Votre facture",
      contenu,
      cta: { texte: "Voir mes factures", url: urlApp("/tableau-de-bord/factures") },
    }),
  };
}

// ---------- Facture de vente producteur ----------

export function emailFactureVente(params: {
  displayName: string;
  numeroVente: string;
  totalCents: number;
  orderId: string;
}): ContenuEmail {
  const contenu = `
    <p style="font-size:15px;margin:0 0 12px 0;line-height:1.5;">
      Bonjour ${echapperHtml(params.displayName)},
    </p>
    <p style="font-size:15px;margin:0 0 16px 0;line-height:1.5;">
      Votre facture de vente <strong>${echapperHtml(params.numeroVente)}</strong> (${formaterPrixEmail(params.totalCents)}) est jointe à cet email, au format Factur-X.
    </p>
    <p style="font-size:14px;margin:0 0 0 0;line-height:1.5;color:#6b5f4e;">
      Vous la retrouverez aussi à tout moment dans votre espace, onglet «&nbsp;Mes factures&nbsp;».
    </p>
  `;

  return {
    subject: `Votre facture de vente ${params.numeroVente}`,
    ...gabaritEmail({
      titre: "Votre facture de vente",
      contenu,
      cta: { texte: "Voir mes factures", url: urlApp("/tableau-de-bord/factures") },
    }),
  };
}
