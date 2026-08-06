// Indique si les clés Supabase sont configurées dans .env.local
// Tant qu'elles ne le sont pas, le site fonctionne en mode « vitrine »
// (pages publiques accessibles, comptes désactivés).
export function estSupabaseConfigure(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
