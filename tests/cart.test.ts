import test from "node:test";
import assert from "node:assert/strict";
import {
  cartLineKey,
  cartReducer,
  getProductChoices,
  parseCart,
  resolveCart,
  type CartLine,
} from "../src/lib/cart";
import {
  catalogSchema,
  formatPrice,
  getStartingPrice,
} from "../src/lib/catalog-schema";
import fixture from "../src/data/demo-catalog.json";

const catalog = catalogSchema.parse(fixture);
const pizza = catalog.products.find((product) => product.slug === "mussarela")!;
const calzone = catalog.products.find(
  (product) => product.slug === "kalzone-de-pizza",
)!;
const drink = catalog.products.find(
  (product) => product.slug === "coca-cola-2l",
)!;
const small = catalog.sizes.find(
  (size) => size.product_id === pizza.id && size.name === "Pequena",
)!;
const large = catalog.sizes.find(
  (size) => size.product_id === pizza.id && size.name === "Maracanã",
)!;
const choices = getProductChoices(catalog, pizza.id);
const flavor = choices.groups.find((group) => group.kind === "flavor")!;
const crust = choices.groups.find((group) => group.kind === "crust")!;
const extra = choices.groups.find((group) => group.kind === "extra")!;
const calabresa = flavor.options.find((option) => option.name === "Calabresa")!;
const catupiry = crust.options.find(
  (option) => option.name === "Borda de Catupiry",
)!;
const milho = extra.options.find((option) => option.name === "Milho")!;
const baseSelection = {
  productId: pizza.id,
  sizeId: small.id,
  optionIds: [],
  notes: "",
};

test("cardápio transcrito contém 21 pizzas, 2 kalzones, 5 bebidas e quatro tamanhos por pizza", () => {
  assert.equal(catalog.categories.length, 3);
  assert.equal(catalog.products.length, 28);
  assert.equal(catalog.sizes.length, 84);
  assert.equal(catalog.productOptionRelations.length, 588);
  assert.equal(choices.sizes.length, 4);
  assert.equal(flavor.options.length, 20);
  assert.equal(crust.options.length, 2);
  assert.equal(extra.options.length, 6);
  assert.equal(getStartingPrice(pizza, catalog.sizes).cents, 5000);
  assert.match(formatPrice(5000), /50,00/);
});

test("pizza inteira e meio a meio custam o mesmo por tamanho", () => {
  const whole: CartLine = { ...baseSelection, quantity: 1 };
  const half: CartLine = { ...whole, optionIds: [calabresa.id] };
  assert.equal(resolveCart([whole], catalog)[0].unitPriceCents, 5000);
  const resolved = resolveCart([half], catalog)[0];
  assert.equal(resolved.unitPriceCents, 5000);
  assert.equal(resolved.flavorOption?.name, "Calabresa");
  assert.equal(
    resolveCart([{ ...half, sizeId: large.id }], catalog)[0].unitPriceCents,
    7000,
  );
});

test("borda e adicional somam ao preço e itens distintos não se misturam", () => {
  const configured: CartLine = {
    ...baseSelection,
    optionIds: [calabresa.id, catupiry.id, milho.id],
    notes: "sem cebola",
    quantity: 2,
  };
  assert.equal(resolveCart([configured], catalog)[0].lineTotalCents, 11000);
  let lines = cartReducer([], { type: "add", line: baseSelection });
  lines = cartReducer(lines, { type: "add", line: baseSelection });
  lines = cartReducer(lines, {
    type: "add",
    line: {
      ...baseSelection,
      optionIds: configured.optionIds,
      notes: configured.notes,
    },
  });
  assert.equal(lines.length, 2);
  assert.equal(lines[0].quantity, 2);
  const key = cartLineKey(baseSelection);
  assert.equal(
    cartReducer(lines, { type: "quantity", key, quantity: -1 })[0].quantity,
    2,
  );
  assert.equal(
    cartReducer(lines, { type: "quantity", key, quantity: 0 }).length,
    1,
  );
  assert.equal(cartReducer(lines, { type: "remove", key }).length, 1);
  assert.deepEqual(cartReducer(lines, { type: "clear" }), []);
});

test("calzones e bebidas não recebem tamanho, segundo sabor, bordas ou adicionais", () => {
  assert.equal(getProductChoices(catalog, calzone.id).sizes.length, 0);
  assert.equal(getProductChoices(catalog, calzone.id).groups.length, 0);
  assert.equal(getProductChoices(catalog, drink.id).groups.length, 0);
  assert.equal(
    resolveCart(
      [
        {
          productId: calzone.id,
          sizeId: null,
          optionIds: [],
          notes: "",
          quantity: 1,
        },
      ],
      catalog,
    )[0].unitPriceCents,
    2500,
  );
  assert.equal(
    resolveCart(
      [
        {
          productId: drink.id,
          sizeId: null,
          optionIds: [],
          notes: "",
          quantity: 1,
        },
      ],
      catalog,
    )[0].unitPriceCents,
    1400,
  );
});

test("opções inválidas, tamanho ausente e produto indisponível não entram no total", () => {
  const valid: CartLine = {
    ...baseSelection,
    optionIds: [calabresa.id],
    quantity: 1,
  };
  assert.deepEqual(resolveCart([{ ...valid, sizeId: null }], catalog), []);
  assert.deepEqual(
    resolveCart(
      [{ ...valid, optionIds: [calabresa.id, flavor.options[1].id] }],
      catalog,
    ),
    [],
  );
  assert.deepEqual(
    resolveCart(
      [{ ...valid, optionIds: [calabresa.id, calabresa.id] }],
      catalog,
    ),
    [],
  );
  assert.deepEqual(
    resolveCart(
      [{ ...valid, optionIds: ["11111111-1111-4111-8111-111111111111"] }],
      catalog,
    ),
    [],
  );
  assert.deepEqual(
    resolveCart([valid], {
      ...catalog,
      products: catalog.products.map((product) =>
        product.id === pizza.id ? { ...product, available: false } : product,
      ),
    }),
    [],
  );
});

test("carrinho persiste IDs sem preços e rejeita dados manipulados", () => {
  const legacy = { productId: pizza.id, quantity: 2 };
  assert.deepEqual(parseCart(JSON.stringify({ version: 2, items: [legacy] })), [
    {
      productId: pizza.id,
      sizeId: null,
      optionIds: [],
      notes: "",
      quantity: 2,
    },
  ]);
  const valid: CartLine = { ...baseSelection, quantity: 2 };
  assert.deepEqual(parseCart(JSON.stringify({ version: 3, items: [valid] })), [
    valid,
  ]);
  for (const items of [
    [{ ...valid, price: 1 }],
    [{ ...valid, quantity: -2 }],
    [{ ...valid, optionIds: [calabresa.id, calabresa.id] }],
    [valid, valid],
  ]) {
    assert.deepEqual(parseCart(JSON.stringify({ version: 3, items })), []);
  }
  assert.deepEqual(parseCart("{broken"), []);
});
