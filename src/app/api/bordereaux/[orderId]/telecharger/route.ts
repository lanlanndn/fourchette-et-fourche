import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Téléchargement du bordereau d'envoi (bucket privé → URL signée 60 s).
 * GET /api/bordereaux/{orderId}/telecharger
 * Autorisation : uniquement le producteur concerné par la commande.
 */
type Props = { params: Promise<{ orderId: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { orderId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ erreur: "Non connecté" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: { listing: { select: { producerId: true } } },
      },
    },
  });
  if (!order) {
    return NextResponse.json({ erreur: "Commande introuvable" }, { status: 404 });
  }

  const estProducteurConcerne = order.items.some(
    (item) => item.listing.producerId === user.id,
  );
  if (!estProducteurConcerne) {
    return NextResponse.json({ erreur: "Interdit" }, { status: 403 });
  }

  if (!order.bordereauPath) {
    return NextResponse.json(
      { erreur: "Bordereau en cours de génération — réessayez dans un instant." },
      { status: 404 },
    );
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.storage
      .from("bordereaux")
      .createSignedUrl(order.bordereauPath, 60);
    if (error || !data?.signedUrl) {
      console.error("[bordereau] URL signée impossible :", error?.message);
      return NextResponse.json(
        { erreur: "Téléchargement indisponible" },
        { status: 500 },
      );
    }
    return NextResponse.redirect(data.signedUrl, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[bordereau] erreur téléchargement :", err);
    return NextResponse.json(
      { erreur: "Téléchargement indisponible" },
      { status: 500 },
    );
  }
}
