"use client";

import { useState } from "react";
import { createOrGetConversationAction } from "@/lib/actions/messagerie";

export default function BoutonContacter({
  listingId,
  estConnecte,
}: {
  listingId: string;
  estConnecte: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);

  if (!estConnecte) {
    return (
      <a
        href="/connexion"
        className="relief w-full rounded-sm border-2 border-encre bg-outremer px-6 py-3.5 font-texte text-sm font-bold tracking-wide text-platre text-center uppercase transition-all hover:-translate-y-0.5 hover:bg-outremer-nuit block"
      >
        Connectez-vous pour contacter
      </a>
    );
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="relief w-full rounded-sm border-2 border-encre bg-outremer px-6 py-3.5 font-texte text-sm font-bold tracking-wide text-platre text-center uppercase transition-all hover:-translate-y-0.5 hover:bg-outremer-nuit cursor-pointer"
      >
        Contacter le producteur
      </button>
    );
  }

  return (
    <form action={createOrGetConversationAction} className="space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <textarea
        name="message"
        rows={3}
        required
        placeholder="Bonjour, je suis intéressé par votre annonce…"
        className="champ focus:champ-focus w-full"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="relief flex-1 rounded-sm border-2 border-encre bg-garance px-4 py-2.5 font-texte text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce cursor-pointer"
        >
          Envoyer
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-sm border-2 border-encre bg-platre px-4 py-2.5 text-sm font-bold text-encre-doux uppercase transition-colors hover:bg-platre-fonce cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
