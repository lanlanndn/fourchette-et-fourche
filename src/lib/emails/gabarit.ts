// Palette « Enseigne peinte » — source : DESIGN.md
const C = {
  platre: "#f1eada",
  craie: "#fbf7ec",
  outremer: "#1e3f8c",
  outremerNuit: "#152c66",
  garance: "#b93a1d",
  garanceFonce: "#93290f",
  ocre: "#dda92c",
  verdigris: "#2f6b4f",
  encre: "#28221b",
  encreDoux: "#6b5f4e",
};

/** Échappe les caractères HTML pour éviter les injections. */
export function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Construit une URL absolue vers l'app. */
export function urlApp(chemin: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${chemin}`;
}

/** Formate un prix en centimes → euros avec 2 décimales. */
export function formaterPrixEmail(centimes: number): string {
  return (centimes / 100).toFixed(2).replace(".", ",") + " €";
}

/** Layout d'email commun « Enseigne peinte ». */
export function gabaritEmail(params: {
  titre: string;
  contenu: string;
  cta?: { texte: string; url: string };
}): { html: string; text: string } {
  const annee = new Date().getFullYear();

  const bouton = params.cta
    ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0 0;">
      <tr>
        <td align="center" style="background-color:${C.garance};border:2px solid ${C.encre};padding:10px 24px;">
          <a href="${params.cta.url}" style="color:${C.platre};text-decoration:none;font-weight:700;font-size:16px;font-family:Chivo,Arial,sans-serif;display:inline-block;">
            ${echapperHtml(params.cta.texte)}
          </a>
        </td>
      </tr>
    </table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Caprasimo&family=Chivo:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:${C.platre};font-family:Chivo,Arial,sans-serif;color:${C.encre};">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.platre};">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <!-- Bandeau -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:${C.outremer};">
          <tr>
            <td align="center" style="padding:24px 16px;">
              <span style="font-family:Caprasimo,Georgia,serif;font-size:24px;color:${C.platre};letter-spacing:0.04em;">
                Fourchette &amp; Fourche
              </span>
            </td>
          </tr>
        </table>

        <!-- Carte -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:${C.craie};border:2px solid ${C.encre};border-top:none;">
          <tr>
            <td style="padding:24px 20px;">

              <h1 style="font-family:Caprasimo,Georgia,serif;font-size:22px;color:${C.encre};margin:0 0 16px 0;line-height:1.3;text-transform:uppercase;letter-spacing:0.03em;">
                ${echapperHtml(params.titre)}
              </h1>

              ${params.contenu}
              ${bouton}

            </td>
          </tr>
        </table>

        <!-- Pied -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;margin-top:16px;">
          <tr>
            <td align="center" style="padding:0 20px 24px 20px;font-size:12px;color:${C.encreDoux};line-height:1.6;">
              <p style="margin:0 0 8px 0;">
                Vous recevez cet email car vous utilisez <strong>Fourchette &amp; Fourche</strong>.
              </p>
              <p style="margin:0 0 8px 0;">
                <a href="${urlApp("/tableau-de-bord/profil")}" style="color:${C.encreDoux};text-decoration:underline;">Gérer mes préférences d'emails</a>
                &nbsp;·&nbsp;
                <a href="${urlApp("/mentions-legales")}" style="color:${C.encreDoux};text-decoration:underline;">Mentions légales</a>
                &nbsp;·&nbsp;
                <a href="${urlApp("/politique-confidentialite")}" style="color:${C.encreDoux};text-decoration:underline;">Confidentialité</a>
              </p>
              <p style="margin:0;">© ${annee} Fourchette &amp; Fourche</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  // Version texte simple
  const text = `${params.titre}\n\n${params.contenu.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()}\n\n${params.cta ? `${params.cta.texte} : ${params.cta.url}\n\n` : ""}Fourchette & Fourche — ${urlApp("/")}`;

  return { html, text };
}

/** Extrait les N premiers caractères d'un texte (pour l'aperçu de message). */
export function extraitTexte(texte: string, max: number = 140): string {
  if (texte.length <= max) return texte;
  return texte.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
