import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./env";
import type { Database } from "@/types/database.generated";

// O catálogo usa a chave pública e respeita RLS, mesmo no servidor.
// Nenhuma credencial privilegiada é necessária nesta fase.
export function createCatalogClient() {
  const { url, key } = getSupabasePublicConfig();
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
