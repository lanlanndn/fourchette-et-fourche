import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UNITES, formaterPrix } from "@/lib/constantes";
import { markConversationAsRead } from "@/lib/actions/messagerie";
import FormulaireMessage from "./FormulaireMessage";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: "Conversation" };
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const user = await requireUser();

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      participants: { some: { userId: user.id } },
    },
    include: {
      listing: {
        select: { id: true, title: true, category: true, priceCents: true, unit: true },
      },
      participants: {
        include: {
          user: { select: { id: true, displayName: true, role: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, displayName: true } },
        },
      },
    },
  });

  if (!conversation) notFound();

  // Marquer comme lu
  await markConversationAsRead(id);

  const autre = conversation.participants.find(
    (p) => p.userId !== user.id,
  )?.user;

  return (
    <div className="space-y-4">
      {/* En-tête : infos annonce + interlocuteur */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/tableau-de-bord/messagerie"
          className="etiquette text-encre-doux transition-colors hover:text-garance"
        >
          ← Retour à la messagerie
        </Link>
      </div>

      <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-encre bg-platre-fonce text-sm font-bold text-encre">
            {autre?.displayName?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-encre">
              {autre?.displayName ?? "Inconnu"}
            </p>
            <p className="text-sm text-encre-doux">
              À propos de{" "}
              <Link
                href={`/annonces/${conversation.listing.id}`}
                className="font-medium text-outremer underline underline-offset-2 hover:text-outremer-nuit"
              >
                {conversation.listing.title}
              </Link>
              {" "}· {formaterPrix(conversation.listing.priceCents)} /{" "}
              {UNITES[conversation.listing.unit] ?? conversation.listing.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {conversation.messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-encre-doux">
            Aucun message. Écrivez le premier !
          </p>
        ) : (
          conversation.messages.map((msg) => {
            const estMoi = msg.senderId === user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${estMoi ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] border-2 border-encre px-4 py-3 ${
                    estMoi
                      ? "bg-outremer text-platre"
                      : "bg-[#fbf7ec] text-encre"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  <p
                    className={`mt-2 text-[10px] ${
                      estMoi ? "text-platre/60" : "text-encre-doux/70"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Formulaire d'envoi */}
      <div className="sticky bottom-0 border-t-2 border-encre bg-platre py-4">
        <FormulaireMessage conversationId={conversation.id} />
      </div>
    </div>
  );
}
