export type PreferenceOrder = {
  id: string;
  total_cents: number;
  delivery_fee_cents: number;
};
export type PreferenceItem = {
  product_name: string;
  size_name: string | null;
  quantity: number;
  unit_price_cents: number;
};

export function buildTestPreference(
  order: PreferenceOrder,
  items: PreferenceItem[],
  appUrl: string,
) {
  const itemTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_cents,
    0,
  );
  if (
    !items.length ||
    itemTotal + order.delivery_fee_cents !== order.total_cents
  ) {
    throw new Error("PREFERENCE_TOTAL_MISMATCH");
  }
  const returnUrl = `${appUrl}/pedido/${order.id}`;
  return {
    items: [
      ...items.map((item, index) => ({
        id: `${order.id}-${index + 1}`,
        title: `${item.product_name}${item.size_name ? ` — ${item.size_name}` : ""}`,
        quantity: item.quantity,
        currency_id: "BRL",
        unit_price: item.unit_price_cents / 100,
      })),
      ...(order.delivery_fee_cents
        ? [
            {
              id: `${order.id}-delivery`,
              title: "Taxa de entrega",
              quantity: 1,
              currency_id: "BRL",
              unit_price: order.delivery_fee_cents / 100,
            },
          ]
        : []),
    ],
    external_reference: order.id,
    back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
    auto_return: "approved",
    notification_url: `${appUrl}/api/webhooks/mercadopago`,
    payment_methods: {
      excluded_payment_types: [
        { id: "ticket" },
        { id: "debit_card" },
        { id: "prepaid_card" },
      ],
    },
  };
}

export function sandboxCheckoutUrl(raw: string) {
  const url = new URL(raw);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "sandbox.mercadopago.com" ||
    url.username ||
    url.password
  )
    throw new Error("INVALID_SANDBOX_URL");
  return url.toString();
}
