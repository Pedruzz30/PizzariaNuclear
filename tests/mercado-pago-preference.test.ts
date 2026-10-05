import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTestPreference,
  sandboxCheckoutUrl,
} from "../src/lib/mercado-pago-preference";

test("preferência usa total confirmado no banco, taxa e URLs HTTPS de retorno", () => {
  const id = "10000000-0000-4000-8000-000000000090";
  const order = { id, total_cents: 6500, delivery_fee_cents: 1000 };
  const items = [
    {
      product_name: "Mussarela",
      size_name: "Pequena",
      quantity: 1,
      unit_price_cents: 5500,
    },
  ];
  const body = buildTestPreference(order, items, "https://preview.example.com");
  assert.equal(
    body.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    65,
  );
  assert.equal(body.external_reference, id);
  assert.equal(
    body.notification_url,
    "https://preview.example.com/api/webhooks/mercadopago",
  );
  assert.throws(() =>
    buildTestPreference(
      { ...order, total_cents: 1 },
      items,
      "https://preview.example.com",
    ),
  );
});

test("checkout aceita somente URL do sandbox Mercado Pago", () => {
  assert.equal(
    sandboxCheckoutUrl("https://sandbox.mercadopago.com/checkout/pay?id=1"),
    "https://sandbox.mercadopago.com/checkout/pay?id=1",
  );
  assert.throws(() =>
    sandboxCheckoutUrl("https://www.mercadopago.com/checkout/pay"),
  );
  assert.throws(() =>
    sandboxCheckoutUrl("http://sandbox.mercadopago.com/checkout/pay"),
  );
});
