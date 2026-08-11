import { NextResponse } from "next/server";
import { emailsActives, expediteur, envoyerEmail } from "@/lib/emails/envoi";
import { emailConfirmationAcheteur } from "@/lib/emails/templates";

/**
 * Route de test pour vérifier que Resend est bien configuré.
 * GET /api/test-email — envoie un email de test et retourne le résultat.
 */
export async function GET() {
  const active = emailsActives();
  const from = expediteur();

  if (!active) {
    return NextResponse.json({
      ok: false,
      raison: "RESEND_API_KEY absente ou invalide",
      expediteur: from,
    });
  }

  const envoye = await envoyerEmail({
    to: process.env.RESEND_TEST_TO ?? from.replace(/.*<(.*)>/, "$1"),
    ...emailConfirmationAcheteur({
      displayName: "Testeur",
      titreProduit: "Produit de test",
      quantite: 1,
      unite: "pièce",
      prixUnitaireCents: 1000,
      totalCents: 1000,
      orderId: "test-123",
    }),
  });

  return NextResponse.json({
    ok: envoye,
    expediteur: from,
    message: envoye
      ? "Email envoyé — vérifie le dashboard Resend"
      : "Échec de l'envoi — voir les logs Vercel",
  });
}
