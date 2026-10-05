import "server-only";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { CheckoutInput } from "@/lib/checkout-schema";
import { getCheckoutConfig } from "./checkout-config";

export const ORDER_SESSION_COOKIE = "nuclear-order-session";
export const hashSession = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function validSessionToken(token: string | undefined): token is string {
  return Boolean(token && /^[a-f0-9]{64}$/.test(token));
}

export function getOrderDatabase() {
  const config = getCheckoutConfig();
  if (!config) return null;
  const db = createClient(config.supabaseUrl, config.supabaseSecret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return { db, config };
}

export async function createOrder(input: CheckoutInput, sessionToken: string) {
  const connection = getOrderDatabase();
  if (!connection) throw new Error("CHECKOUT_NOT_CONFIGURED");
  const { db, config } = connection;
  const payloadHash = createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
  const { data, error } = await db.rpc("create_checkout_order", {
    p_store_id: config.storeId,
    p_session_hash: hashSession(sessionToken),
    p_idempotency_key: input.idempotencyKey,
    p_payload_hash: payloadHash,
    p_customer_name: input.customerName,
    p_customer_phone: input.customerPhone,
    p_customer_email: input.customerEmail,
    p_order_type: input.orderType,
    p_customer_notes: input.customerNotes,
    p_items: input.items,
    p_address: input.address,
  });
  if (error || !data || typeof data !== "object") {
    throw new Error(error?.message || "ORDER_CREATION_FAILED");
  }
  const result = data as {
    order_id: string;
    payment_id: string;
    number: number;
    existing: boolean;
  };
  const [order, payment, items] = await Promise.all([
    db
      .from("orders")
      .select("id,total_cents,delivery_fee_cents,customer_email")
      .eq("id", result.order_id)
      .single(),
    db
      .from("payments")
      .select("id,idempotency_key,provider_order_id,checkout_url")
      .eq("id", result.payment_id)
      .single(),
    db
      .from("order_items")
      .select("product_name,size_name,quantity,unit_price_cents")
      .eq("order_id", result.order_id),
  ]);
  if (
    order.error ||
    payment.error ||
    items.error ||
    !order.data ||
    !payment.data ||
    !items.data
  ) {
    throw new Error("ORDER_READ_FAILED");
  }
  return {
    result,
    order: order.data,
    payment: payment.data,
    items: items.data,
    db,
    config,
  };
}

export async function getOrderForSession(
  orderId: string,
  sessionToken: string | undefined,
) {
  if (!validSessionToken(sessionToken)) return null;
  const connection = getOrderDatabase();
  if (!connection) return null;
  const { db } = connection;
  const access = await db
    .from("checkout_requests")
    .select("order_id")
    .eq("order_id", orderId)
    .eq("session_hash", hashSession(sessionToken))
    .limit(1)
    .maybeSingle();
  if (access.error || !access.data) return null;
  const [order, items] = await Promise.all([
    db
      .from("orders")
      .select(
        "id,public_order_number,order_type,subtotal_cents,delivery_fee_cents,total_cents,payment_status,order_status,created_at",
      )
      .eq("id", orderId)
      .single(),
    db
      .from("order_items")
      .select("id,product_name,size_name,quantity,total_price_cents")
      .eq("order_id", orderId),
  ]);
  if (order.error || items.error || !order.data || !items.data) return null;
  const options = items.data.length
    ? await db
        .from("order_item_options")
        .select("order_item_id,group_name,option_name")
        .in(
          "order_item_id",
          items.data.map((item) => item.id),
        )
    : { data: [], error: null };
  if (options.error || !options.data) return null;
  return { order: order.data, items: items.data, options: options.data };
}
