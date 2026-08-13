import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererFacturesCommande } from "@/lib/facturation/generer";

/**
 * Route de diagnostic et de rattrapage de la facturation.
 * GET /api/test-facture?orderId=xxx — régénère les factures d'une commande payée
 * (idempotent : ne crée rien si les factures existent déjà).
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

  const resultat = await genererFacturesCommande(orderId);
  return NextResponse.json({ orderId, ...resultat });
}
