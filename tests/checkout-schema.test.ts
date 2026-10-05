import assert from "node:assert/strict";
import test from "node:test";
import { checkoutInputSchema } from "../src/lib/checkout-schema";

const input = {
  idempotencyKey: "10000000-0000-4000-8000-000000000090",
  customerName: "Cliente Teste",
  customerPhone: "(24) 99999-9999",
  customerEmail: "",
  orderType: "pickup",
  customerNotes: "",
  address: null,
  items: [
    {
      productId: "10000000-0000-4000-8000-000000000011",
      sizeId: null,
      optionIds: [],
      notes: "",
      quantity: 1,
    },
  ],
};

test("checkout normaliza contato e rejeita valores enviados pelo navegador", () => {
  const parsed = checkoutInputSchema.parse(input);
  assert.equal(parsed.customerPhone, "24999999999");
  assert.equal(parsed.customerEmail, null);
  assert.equal(
    checkoutInputSchema.safeParse({ ...input, totalCents: 1 }).success,
    false,
  );
  assert.equal(
    checkoutInputSchema.safeParse({
      ...input,
      items: [{ ...input.items[0], priceCents: 1 }],
    }).success,
    false,
  );
  assert.equal(
    checkoutInputSchema.safeParse({ ...input, orderType: "delivery" }).success,
    false,
  );
});
