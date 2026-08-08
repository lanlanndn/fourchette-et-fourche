import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/constantes";

export const metadata: Metadata = { title: "Messagerie" };

export default async function MessageriePage() {
  const user = await requireUser();

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      listing: {
        select: { id: true, title: true, category: true },
      },
      participants: {
        include: {
          user: { select: { id: true, displayName: true, role: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true, isRead: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-affiche text-3xl text-encre uppercase">
          Messagerie
        </h1>
        <p className="mt-1 text-sm text-encre-doux">
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="relief-doux border-2 border-encre bg-[#fbf7ec] p-10 text-center">
          <p className="font-affiche text-2xl text-encre uppercase">
            Aucune conversation
          </p>
          <p className="mt-2 text-sm text-encre-doux">
            Parcourez les annonces et contactez un producteur pour démarrer une
            conversation.
          </p>
          <Link
            href="/annonces"
            className="mt-5 inline-block rounded-sm border-2 border-encre bg-garance px-6 py-3 font-texte text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce"
          >
            Voir les annonces
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {conversations.map((conv) => {
            // L'autre participant (pas l'utilisateur courant)
            const autre = conv.participants.find(
              (p) => p.userId !== user.id,
            )?.user;
            const dernierMessage = conv.messages[0];
            const estNonLu =
              dernierMessage &&
              !dernierMessage.isRead &&
              dernierMessage.senderId !== user.id;

            return (
              <Link
                key={conv.id}
                href={`/tableau-de-bord/messagerie/${conv.id}`}
                className={`flex items-center gap-4 border-2 border-encre p-4 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgb(40_34_27/0.4)] ${
                  estNonLu
                    ? "bg-[#fbf7ec] relief"
                    : "bg-[#fbf7ec]/50 relief-doux"
                }`}
              >
                {/* Avatar simple */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border-2 border-encre bg-platre-fonce text-sm font-bold text-encre">
                  {autre?.displayName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-encre">
                      {autre?.displayName ?? "Inconnu"}
                    </p>
                    {estNonLu && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-garance" />
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-encre-doux">
                    {dernierMessage?.content ?? "Nouvelle conversation"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs text-encre-doux">
                    {conv.listing.title}
                  </p>
                  {dernierMessage && (
                    <p className="mt-0.5 text-[10px] text-encre-doux/70">
                      {new Date(dernierMessage.createdAt).toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "short" },
                      )}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
