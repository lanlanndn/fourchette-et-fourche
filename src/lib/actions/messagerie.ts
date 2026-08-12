"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { notifierNouveauMessage } from "@/lib/emails/notifications";

// ---------- Créer ou retrouver une conversation ----------

export async function createOrGetConversationAction(formData: FormData) {
  const user = await requireUser();

  const listingId = formData.get("listingId") as string;
  const message = formData.get("message") as string;

  if (!listingId || !message?.trim()) {
    throw new Error("Informations manquantes.");
  }

  // Vérifier que l'annonce existe et est active
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || !listing.isActive) {
    throw new Error("Cette annonce n'est plus disponible.");
  }

  if (listing.producerId === user.id) {
    throw new Error("Vous ne pouvez pas vous contacter vous-même.");
  }

  // Chercher une conversation existante entre ce user et ce listing
  const existante = await prisma.conversation.findFirst({
    where: {
      listingId,
      participants: { some: { userId: user.id } },
    },
  });

  let conversationId = existante?.id;

  if (!existante) {
    // Créer la conversation + ajouter les deux participants + premier message
    const conv = await prisma.conversation.create({
      data: {
        listingId,
        participants: {
          create: [
            { userId: user.id },
            { userId: listing.producerId },
          ],
        },
        messages: {
          create: {
            senderId: user.id,
            content: message.trim(),
          },
        },
      },
    });
    conversationId = conv.id;
  } else {
    // Ajouter un nouveau message dans la conversation existante
    await prisma.message.create({
      data: {
        conversationId: existante.id,
        senderId: user.id,
        content: message.trim(),
      },
    });
  }

  revalidatePath("/tableau-de-bord/messagerie");

  // Notifier le destinataire (non bloquant, dans after())
  await notifierNouveauMessage({ conversationId: conversationId!, senderId: user.id });

  redirect(`/tableau-de-bord/messagerie/${conversationId}`);
}

// ---------- Envoyer un message ----------

const schemaMessage = z.object({
  content: z.string().min(1, "Écris un message.").max(2000, "2000 caractères maximum."),
});

export async function sendMessageAction(
  conversationId: string,
  _prev: { erreur?: string; succes?: string } | null,
  formData: FormData,
) {
  const user = await requireUser();

  // Vérifier que l'utilisateur participe à cette conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: user.id },
    },
  });
  if (!participant) {
    return { erreur: "Vous ne participez pas à cette conversation." };
  }

  const brut = { content: formData.get("content") };
  const validation = schemaMessage.safeParse(brut);
  if (!validation.success) {
    return { erreur: validation.error.issues[0].message };
  }

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content: validation.data.content.trim(),
    },
  });

  // Notifier le destinataire (non bloquant, dans after())
  await notifierNouveauMessage({ conversationId, senderId: user.id });

  revalidatePath(`/tableau-de-bord/messagerie/${conversationId}`);
  revalidatePath("/tableau-de-bord/messagerie");

  return { succes: "" }; // succès vide = pas de message affiché, juste le champ vidé
}

// ---------- Compter les messages non lus ----------

export async function countUnreadMessages(): Promise<number> {
  try {
    const user = await requireUser();
    const count = await prisma.message.count({
      where: {
        conversation: { participants: { some: { userId: user.id } } },
        senderId: { not: user.id },
        isRead: false,
      },
    });
    return count;
  } catch {
    return 0;
  }
}

// ---------- Marquer comme lu ----------

export async function markConversationAsRead(conversationId: string) {
  const user = await requireUser();

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: user.id },
      isRead: false,
    },
    data: { isRead: true },
  });
  // Pas de revalidatePath ici : appelé pendant le rendu, c'est interdit.
  // Le badge et la liste se mettront à jour à la prochaine navigation.
}
