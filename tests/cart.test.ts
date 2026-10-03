import test from "node:test";
import assert from "node:assert/strict";
import { cartReducer, parseCart, resolveCart } from "../src/lib/cart";
import { catalogSchema, formatPrice } from "../src/lib/catalog-schema";
import fixture from "../src/data/demo-catalog.json";
const catalog = catalogSchema.parse(fixture);
const product = catalog.products[0];
test("adiciona, limita quantidade, diminui, remove e limpa", () => {
  let lines = cartReducer([], { type: "add", productId: product.id });
  lines = cartReducer(lines, { type: "add", productId: product.id });
  assert.equal(lines[0].quantity, 2);
  assert.equal(
    cartReducer(lines, {
      type: "quantity",
      productId: product.id,
      quantity: -1,
    })[0].quantity,
    2,
  );
  assert.equal(
    cartReducer(lines, {
      type: "quantity",
      productId: product.id,
      quantity: 1.5,
    })[0].quantity,
    2,
  );
  assert.deepEqual(
    cartReducer(lines, {
      type: "quantity",
      productId: product.id,
      quantity: 0,
    }),
    [],
  );
  assert.deepEqual(
    cartReducer(lines, { type: "remove", productId: product.id }),
    [],
  );
  assert.deepEqual(cartReducer(lines, { type: "clear" }), []);
});
test("persistência rejeita preço injetado, quantidade inválida e IDs duplicados", () => {
  const valid = { productId: product.id, quantity: 2 };
  assert.deepEqual(parseCart(JSON.stringify({ version: 2, items: [valid] })), [
    valid,
  ]);
  for (const items of [
    [{ ...valid, price: 1 }],
    [{ ...valid, quantity: -2 }],
    [{ ...valid, quantity: 1.5 }],
    [valid, valid],
  ]) {
    assert.deepEqual(parseCart(JSON.stringify({ version: 2, items })), []);
  }
  assert.deepEqual(parseCart("{broken"), []);
});
test("valores vêm do catálogo atual e produto indisponível não entra no total", () => {
  const lines = [{ productId: product.id, quantity: 2 }];
  const updated = { ...product, base_price_cents: 5000 };
  assert.equal(resolveCart(lines, [updated])[0].product.base_price_cents, 5000);
  assert.deepEqual(resolveCart(lines, [{ ...updated, available: false }]), []);
  assert.deepEqual(resolveCart(lines, []), []);
});
test("catálogo migrado tem 14 produtos e 4 categorias, com preço em centavos", () => {
  assert.equal(catalog.products.length, 14);
  assert.equal(catalog.categories.length, 4);
  assert.equal(product.base_price_cents, 4290);
  assert.match(formatPrice(4290), /42,90/);
});
