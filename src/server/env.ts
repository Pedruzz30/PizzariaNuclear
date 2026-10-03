import "server-only";
import { z } from "zod";

export function getCatalogSource() {
  const source =
    process.env.CATALOG_SOURCE ??
    (process.env.NODE_ENV === "development" ? "demo" : "supabase");
  if (source !== "demo" && source !== "supabase")
    throw new Error("CATALOG_SOURCE inválido.");
  if (source === "demo" && process.env.VERCEL_ENV === "production") {
    throw new Error(
      "Catálogo demonstrativo não permitido na produção da Vercel.",
    );
  }
  return source;
}

export function getSupabasePublicConfig() {
  const result = z.object({ url: z.url(), key: z.string().min(1) }).safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!result.success)
    throw new Error(
      "Configure a URL e a chave pública do Supabase em .env.local.",
    );
  const endpoint = new URL(result.data.url);
  if (
    endpoint.protocol !== "https:" &&
    !(
      endpoint.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname)
    )
  ) {
    throw new Error(
      "A URL do Supabase precisa usar HTTPS fora do ambiente local.",
    );
  }
  const publicKey = result.data.key;
  if (publicKey.startsWith("sb_secret_")) {
    throw new Error("A chave pública do Supabase não pode ser uma secret key.");
  }
  if (!publicKey.startsWith("sb_publishable_")) {
    try {
      const payload = JSON.parse(
        Buffer.from(publicKey.split(".")[1], "base64url").toString("utf8"),
      );
      if (payload.role !== "anon") throw new Error("role inválido");
    } catch {
      throw new Error("Use uma chave publishable ou anon, nunca service_role.");
    }
  }
  return result.data;
}

export function getStoreId() {
  const result = z.uuid().safeParse(process.env.STORE_ID);
  if (!result.success)
    throw new Error("Configure STORE_ID com o UUID da unidade.");
  return result.data;
}
