import "server-only";
import { z } from "zod";

export function getCheckoutConfig() {
  const parsed = z
    .object({
      appUrl: z.url(),
      supabaseUrl: z.url(),
      supabaseSecret: z.string().min(10),
      mercadoPagoAccessToken: z.string().min(10),
      mercadoPagoWebhookSecret: z.string().min(10),
      storeId: z.uuid(),
    })
    .safeParse({
      appUrl: process.env.APP_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseSecret:
        process.env.SUPABASE_SECRET_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      mercadoPagoAccessToken: process.env.MERCADOPAGO_TEST_ACCESS_TOKEN,
      mercadoPagoWebhookSecret: process.env.MERCADOPAGO_TEST_WEBHOOK_SECRET,
      storeId: process.env.STORE_ID,
    });
  if (!parsed.success) return null;
  const url = new URL(parsed.data.appUrl);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    return null;
  if (process.env.CATALOG_SOURCE !== "supabase") return null;
  return { ...parsed.data, appUrl: url.origin };
}
