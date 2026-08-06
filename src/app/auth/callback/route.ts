import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Route appelée par Supabase après confirmation d'email
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/tableau-de-bord";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Code invalide ou expiré → retour à la connexion
  return NextResponse.redirect(`${origin}/connexion?erreur=lien-expire`);
}
