"use client";

import { useActionState, useRef, useEffect } from "react";
import { sendMessageAction } from "@/lib/actions/messagerie";

export default function FormulaireMessage({
  conversationId,
}: {
  conversationId: string;
}) {
  const action = sendMessageAction.bind(null, conversationId);
  const [etat, actionAvecEtat, enCours] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Vider le champ après un envoi réussi
  useEffect(() => {
    if (etat?.succes !== undefined) {
      formRef.current?.reset();
    }
  }, [etat]);

  return (
    <form ref={formRef} action={actionAvecEtat} className="flex gap-2">
      <input
        type="text"
        name="content"
        required
        placeholder="Votre message…"
        className="champ focus:champ-focus flex-1"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={enCours}
        className="relief rounded-sm border-2 border-encre bg-garance px-5 py-2.5 text-sm font-bold tracking-wide text-platre uppercase transition-all hover:-translate-y-0.5 hover:bg-garance-fonce disabled:cursor-not-allowed disabled:opacity-50"
      >
        {enCours ? "…" : "Envoyer"}
      </button>
    </form>
  );
}
