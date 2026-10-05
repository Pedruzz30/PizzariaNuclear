import "server-only";
import { z } from "zod";
import {
  parseVerifiedPayment,
  paymentReconciliationEventId,
} from "@/lib/payment-verification";
import {
  buildTestPreference,
  sandboxCheckoutUrl,
} from "@/lib/mercado-pago-preference";
import { getOrderDatabase } from "./orders";

type CheckoutOrder = Awaited<ReturnType<typeof import("./orders").createOrder>>;

const preferenceSchema = z.object({
  id: z.string().min(1).max(120),
  sandbox_init_point: z.url(),
});

export async function createPaymentPreference(checkout: CheckoutOrder) {
  const { config, order, payment, items, db } = checkout;
  if (payment.checkout_url) return sandboxCheckoutUrl(payment.checkout_url);
  const body = buildTestPreference(order, items, config.appUrl);
  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.mercadoPagoAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error("PREFERENCE_CREATION_FAILED");
  const preference = preferenceSchema.parse(await response.json());
  const checkoutUrl = sandboxCheckoutUrl(preference.sandbox_init_point);
  const saved = await db.rpc("record_checkout_preference", {
    p_payment_id: payment.id,
    p_provider_order_id: preference.id,
    p_checkout_url: checkoutUrl,
  });
  if (saved.error) throw new Error("PREFERENCE_SAVE_FAILED");
  return checkoutUrl;
}

export async function reconcileMercadoPagoPayment(
  paymentId: string,
  eventId: string,
  expectedOrderId?: string,
) {
  if (!/^\d{1,30}$/.test(paymentId)) throw new Error("INVALID_PAYMENT_ID");
  const connection = getOrderDatabase();
  if (!connection) throw new Error("CHECKOUT_NOT_CONFIGURED");
  const { db, config } = connection;
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: { Authorization: `Bearer ${config.mercadoPagoAccessToken}` },
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error("PAYMENT_LOOKUP_FAILED");
  const raw: unknown = await response.json();
  const rawReference = z.object({ external_reference: z.uuid() }).parse(raw);
  if (expectedOrderId && rawReference.external_reference !== expectedOrderId)
    throw new Error("PAYMENT_MISMATCH");
  const order = await db
    .from("orders")
    .select("id,total_cents")
    .eq("id", rawReference.external_reference)
    .eq("store_id", config.storeId)
    .maybeSingle();
  if (order.error || !order.data) throw new Error("PAYMENT_ORDER_NOT_FOUND");
  const payment = parseVerifiedPayment(
    raw,
    order.data.id,
    order.data.total_cents,
  );
  if (payment.id !== paymentId) throw new Error("PAYMENT_MISMATCH");
  const applied = await db.rpc("apply_verified_payment", {
    p_event_id: paymentReconciliationEventId(eventId, payment.status),
    p_payment_id: payment.id,
    p_external_reference: order.data.id,
    p_amount_cents: payment.amountCents,
    p_currency: payment.currency_id,
    p_provider_status: payment.status,
    p_method: payment.payment_method_id,
    p_live_mode: payment.live_mode,
  });
  if (applied.error) throw new Error("PAYMENT_APPLY_FAILED");
  return applied.data;
}
