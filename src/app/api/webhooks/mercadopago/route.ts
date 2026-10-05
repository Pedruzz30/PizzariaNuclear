import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyMercadoPagoSignature } from "@/lib/payment-verification";
import { getCheckoutConfig } from "@/server/checkout-config";
import { reconcileMercadoPagoPayment } from "@/server/mercado-pago";

export const runtime = "nodejs";

const notificationSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  type: z.string(),
  data: z.object({ id: z.union([z.number(), z.string()]).transform(String) }),
});

export async function POST(request: NextRequest) {
  const config = getCheckoutConfig();
  if (!config)
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  const dataId = request.nextUrl.searchParams.get("data.id");
  if (
    !verifyMercadoPagoSignature({
      signature: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId,
      secret: config.mercadoPagoWebhookSecret,
    })
  )
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  const raw = await request.text();
  if (raw.length > 10000)
    return NextResponse.json({ error: "Invalid payload" }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const parsed = notificationSchema.safeParse(body);
  if (!parsed.success || parsed.data.data.id !== dataId) {
    return NextResponse.json(
      { error: "Invalid notification" },
      { status: 400 },
    );
  }
  if (parsed.data.type !== "payment")
    return NextResponse.json({ received: true });
  try {
    await reconcileMercadoPagoPayment(
      parsed.data.data.id,
      `webhook:${parsed.data.id}`,
    );
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Retry later" }, { status: 503 });
  }
}
