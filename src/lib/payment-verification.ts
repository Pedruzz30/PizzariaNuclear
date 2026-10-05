import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const paymentSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  external_reference: z.uuid(),
  transaction_amount: z.number().positive(),
  currency_id: z.literal("BRL"),
  status: z.enum([
    "pending",
    "in_process",
    "authorized",
    "approved",
    "rejected",
    "cancelled",
    "refunded",
    "partially_refunded",
    "charged_back",
  ]),
  payment_method_id: z.string().min(1),
  live_mode: z.boolean(),
});

export function parseVerifiedPayment(
  value: unknown,
  expectedOrderId: string,
  expectedCents: number,
) {
  const payment = paymentSchema.parse(value);
  const cents = Math.round(payment.transaction_amount * 100);
  if (
    payment.external_reference !== expectedOrderId ||
    cents !== expectedCents ||
    Math.abs(payment.transaction_amount * 100 - cents) > 0.00001 ||
    payment.live_mode
  ) {
    throw new Error("PAYMENT_MISMATCH");
  }
  return { ...payment, amountCents: cents };
}

export function paymentReconciliationEventId(eventId: string, status: string) {
  return eventId.startsWith("return:") ? `${eventId}:${status}` : eventId;
}

export function verifyMercadoPagoSignature({
  signature,
  requestId,
  dataId,
  secret,
}: {
  signature: string | null;
  requestId: string | null;
  dataId: string | null;
  secret: string;
}) {
  if (
    !signature ||
    !requestId ||
    !dataId ||
    !/^[\w-]{1,120}$/.test(requestId) ||
    !/^[a-zA-Z0-9_-]{1,120}$/.test(dataId)
  )
    return false;
  const fields = Object.fromEntries(
    signature.split(",").map((part) => part.trim().split("=", 2)),
  );
  if (
    !/^\d{10,16}$/.test(fields.ts ?? "") ||
    !/^[a-f0-9]{64}$/.test(fields.v1 ?? "")
  )
    return false;
  const message = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${fields.ts};`;
  const actual = Buffer.from(fields.v1, "hex");
  const expected = createHmac("sha256", secret).update(message).digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
