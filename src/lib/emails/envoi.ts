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
  return process.env.EMAIL_FROM ?? "Fourchette & Fourche <noreply@fourchette-fourche.fr>";
}

/** Envoie un email. Ne lève jamais d'exception — loggue et retourne false en cas d'échec. */
export async function envoyerEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.log("[emails] désactivés — clé Resend absente ou placeholder.");
    return false;
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
      return false;
    }

    console.log(`[emails] envoyé à ${params.to} — "${params.subject}"`);
    return true;
  } catch (err) {
    console.error(
      `[emails] échec envoi à ${params.to}:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
