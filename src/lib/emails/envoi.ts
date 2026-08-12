import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const cle = process.env.RESEND_API_KEY;
  if (!cle || cle === "re_a-coller-plus-tard" || !cle.startsWith("re_")) {
    return null;
  }
  _resend = new Resend(cle);
  return _resend;
}

/** Vérifie si les emails sont activés (clé Resend valide configurée). */
export function emailsActives(): boolean {
  return getResend() !== null;
}

/** Adresse d'expédition configurée. */
export function expediteur(): string {
  return process.env.EMAIL_FROM ?? "Fourchette & Fourche <onboarding@resend.dev>";
}

/** Envoie un email. Retourne { ok: true } ou { ok: false, erreur } — ne lève jamais. */
export async function envoyerEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; erreur?: string }> {
  const resend = getResend();
  if (!resend) {
    console.log("[emails] désactivés — clé Resend absente ou placeholder.");
    return { ok: false, erreur: "Clé Resend absente ou invalide" };
  }

  try {
    const { error } = await resend.emails.send({
      from: expediteur(),
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error(`[emails] erreur Resend pour ${params.to}:`, error.message);
      return { ok: false, erreur: error.message };
    }

    console.log(`[emails] envoyé à ${params.to} — "${params.subject}"`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[emails] échec envoi à ${params.to}:`, msg);
    return { ok: false, erreur: msg };
  }
}
