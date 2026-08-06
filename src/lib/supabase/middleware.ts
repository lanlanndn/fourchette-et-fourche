import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { estSupabaseConfigure } from "./config";

// Rafraîchit le cookie de session à chaque requête (sinon les sessions expirent)
export async function updateSession(request: NextRequest) {
  // Tant que Supabase n'est pas configuré, on laisse passer sans session
  if (!estSupabaseConfigure()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Important : ne pas ajouter de logique entre createServerClient et getUser()
  await supabase.auth.getUser();

  return supabaseResponse;
}
