import { NextResponse } from "next/server";
import { emailsActives, expediteur, envoyerEmail } from "@/lib/emails/envoi";
import { emailConfirmationAcheteur } from "@/lib/emails/templates";

/**
 * Route de test pour vérifier que Resend est bien configuré.
 * GET /api/test-email — envoie un email de test et retourne le diagnostic.
 */
export async function GET() {
  const active = emailsActives();
  const from = expediteur();
  const cle = process.env.RESEND_API_KEY ? "présente" : "absente";

  if (!active) {
    return NextResponse.json({
      ok: false,
      raison: "RESEND_API_KEY absente ou invalide",
      cle,
      expediteur: from,
    });
  }

  const resultat = await envoyerEmail({
    to: from.replace(/.*<(.*)>/, "$1"),
    ...emailConfirmationAcheteur({
      displayName: "Testeur",
      titreProduit: "Produit de test",
      quantite: 1,
      unite: "pièce",
      prixUnitaireCents: 1000,
      shippingPriceCents: 0,
      totalCents: 1000,
      orderId: "test-123",
    }),
  });

  return NextResponse.json({
    ok: resultat.ok,
    erreur: resultat.erreur ?? null,
    cle,
    expediteur: from,
  });
}
