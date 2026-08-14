import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Téléchargement d'une facture (bucket privé → URL signée 60 s).
 * GET /api/factures/{id}/telecharger
 * Autorisation : FA → l'acheteur de la commande ; FV → le producteur émetteur ;
 * FC → personne (document de la plateforme, conservé en interne).
 */
type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });
  }

  const facture = await prisma.invoice.findUnique({
    where: { id },
    include: { order: { select: { buyerId: true } } },
  });
  if (!facture) {
    return NextResponse.json({ erreur: "Facture introuvable" }, { status: 404 });
  }

  const estAcheteur =
    facture.type === "ACHETEUR" && facture.order.buyerId === user.id;
  const estProducteurConcerne =
    facture.type === "VENTE" && facture.emitPourUserId === user.id;
  if (!estAcheteur && !estProducteurConcerne) {
    return NextResponse.json({ erreur: "Interdit" }, { status: 403 });
  }

  if (!facture.storagePath) {
    return NextResponse.json(
      { erreur: "PDF en cours de génération — réessayez dans un instant." },
      { status: 404 },
    );
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from("factures")
      .createSignedUrl(facture.storagePath, 60);
    if (error || !data?.signedUrl) {
      console.error("[facturation] URL signée impossible :", error?.message);
      return NextResponse.json(
        { erreur: "Téléchargement indisponible" },
        { status: 500 },
      );
    }
    return NextResponse.redirect(data.signedUrl, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[facturation] erreur téléchargement :", err);
    return NextResponse.json(
      { erreur: "Téléchargement indisponible" },
      { status: 500 },
    );
  }
}
