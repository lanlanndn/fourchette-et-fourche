import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererBordereau } from "@/lib/expedition/generer";

/**
 * Route de diagnostic et de rattrapage du bordereau d'envoi.
 * GET /api/test-bordereau?orderId=xxx — génère le bordereau d'une commande payée
 * (idempotent : ne fait rien si le bordereau existe déjà).
 * Sans orderId : prend la dernière commande payée.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderIdParam = searchParams.get("orderId");

  let orderId = orderIdParam;
  if (!orderId) {
    const derniere = await prisma.order.findFirst({
      where: { status: "PAID" },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    orderId = derniere?.id ?? null;
  }

  if (!orderId) {
    return NextResponse.json({
      ok: false,
      raison: "Aucune commande payée trouvée. Passe orderId en paramètre.",
    });
  }

  const resultat = await genererBordereau(orderId);
  return NextResponse.json({ orderId, ...resultat });
}
