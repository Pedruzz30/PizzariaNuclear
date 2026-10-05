import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { checkoutInputSchema } from "@/lib/checkout-schema";
import { getCheckoutAvailability } from "@/server/checkout-availability";
import { getCheckoutConfig } from "@/server/checkout-config";
import {
  createOrder,
  ORDER_SESSION_COOKIE,
  validSessionToken,
} from "@/server/orders";
import { createPaymentPreference } from "@/server/mercado-pago";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const config = getCheckoutConfig();
  if (!config)
    return NextResponse.json(
      { error: "Pagamento de teste ainda não configurado." },
      { status: 503 },
    );
  if (
    request.headers.get("origin") !== config.appUrl ||
    !request.headers.get("content-type")?.startsWith("application/json")
  ) {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 403 },
    );
  }
  const body = await request.text();
  if (body.length > 30000)
    return NextResponse.json(
      { error: "Pedido muito grande." },
      { status: 413 },
    );
  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Confira os dados do pedido." },
      { status: 400 },
    );
  const availability = await getCheckoutAvailability();
  if (
    !(parsed.data.orderType === "pickup"
      ? availability.pickup
      : availability.delivery)
  ) {
    return NextResponse.json(
      { error: "Esta modalidade ainda não está disponível." },
      { status: 503 },
    );
  }
  const savedToken = request.cookies.get(ORDER_SESSION_COOKIE)?.value;
  const sessionToken = validSessionToken(savedToken)
    ? savedToken
    : randomBytes(32).toString("hex");
  const respond = (data: object, status: number) => {
    const response = NextResponse.json(data, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
    if (!savedToken || savedToken !== sessionToken)
      response.cookies.set(ORDER_SESSION_COOKIE, sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    return response;
  };
  try {
    const checkout = await createOrder(parsed.data, sessionToken);
    const checkoutUrl = await createPaymentPreference(checkout);
    return respond(
      {
        orderId: checkout.order.id,
        orderNumber: checkout.result.number,
        checkoutUrl,
      },
      200,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "CHECKOUT_FAILED";
    if (
      [
        "ORDERING_DISABLED",
        "STORE_CLOSED",
        "DELIVERY_DISABLED",
        "PICKUP_DISABLED",
        "OUTSIDE_DELIVERY_ZONE",
        "MINIMUM_ORDER",
        "PRODUCT_UNAVAILABLE",
      ].some((code) => message.includes(code))
    ) {
      return respond(
        {
          error:
            "Pedido indisponível no momento. Confira horário, itens e região.",
        },
        409,
      );
    }
    if (
      [
        "INVALID_ITEM",
        "INVALID_SIZE",
        "INVALID_OPTION",
        "INVALID_OPTION_COUNT",
        "DUPLICATE_OPTION",
        "INVALID_TOTAL",
        "IDEMPOTENCY_CONFLICT",
      ].some((code) => message.includes(code))
    ) {
      return respond(
        { error: "O cardápio mudou. Atualize a página e confira o pedido." },
        409,
      );
    }
    console.error("checkout_failed", {
      reason: message.replace(/[^A-Z_]/g, "").slice(0, 40),
    });
    return respond(
      { error: "Não foi possível iniciar o pagamento. Tente novamente." },
      502,
    );
  }
}
