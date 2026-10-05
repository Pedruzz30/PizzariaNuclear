import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const source = JSON.parse(readFileSync("src/data/menu-source.json", "utf8"));
const storeId = source.storeId;

function id(key) {
  const bytes = createHash("sha1")
    .update(`pizzaria-nuclear:menu:${key}`)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function requirePrice(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > 100_000_000) {
    throw new Error(`Preço inválido: ${label}`);
  }
  return value;
}

const categoryDefs = [
  { name: "Pizzas", slug: "pizzas" },
  { name: "Kalzones", slug: "kalzones" },
  { name: "Bebidas", slug: "bebidas" },
];
const categories = categoryDefs.map((category, display_order) => ({
  id: id(`category:${category.slug}`),
  store_id: storeId,
  ...category,
  display_order,
  active: true,
}));
const categoryId = Object.fromEntries(
  categories.map((category) => [category.slug, category.id]),
);
const names = [...source.pizzas, ...source.kalzones, ...source.drinks];
if (new Set(names.map((item) => item.slug)).size !== names.length) {
  throw new Error("Slugs duplicados no cardápio");
}
const products = [
  ...source.pizzas.map((item, display_order) => ({
    id: id(`product:pizza:${item.slug}`),
    store_id: storeId,
    category_id: categoryId.pizzas,
    name: item.name,
    slug: item.slug,
    description: item.description,
    image_url: item.image_url ?? null,
    base_price_cents: requirePrice(
      source.sizePrices[0].price_cents,
      "pizza pequena",
    ),
    active: true,
    available: true,
    featured: item.featured ?? false,
    display_order,
    tag: "Pizza",
  })),
  ...source.kalzones.map((item, index) => ({
    id: id(`product:kalzone:${item.slug}`),
    store_id: storeId,
    category_id: categoryId.kalzones,
    name: item.name,
    slug: item.slug,
    description: item.description,
    image_url: null,
    base_price_cents: requirePrice(item.price_cents, item.name),
    active: true,
    available: true,
    featured: false,
    display_order: source.pizzas.length + index,
    tag: "Kalzone",
  })),
  ...source.drinks.map((item, index) => ({
    id: id(`product:drink:${item.slug}`),
    store_id: storeId,
    category_id: categoryId.bebidas,
    name: item.name,
    slug: item.slug,
    description: "",
    image_url: null,
    base_price_cents: requirePrice(item.price_cents, item.name),
    active: true,
    available: true,
    featured: false,
    display_order: source.pizzas.length + source.kalzones.length + index,
    tag: "Bebida",
  })),
];
const pizzaProducts = products.filter(
  (product) => product.category_id === categoryId.pizzas,
);
const sizes = pizzaProducts.flatMap((product) =>
  source.sizePrices.map((size, display_order) => ({
    id: id(`size:${product.slug}:${display_order}`),
    product_id: product.id,
    name: size.name,
    price_cents: requirePrice(size.price_cents, size.name),
    active: true,
    display_order,
  })),
);
const groupDefs = [
  {
    key: "flavor",
    name: "Segundo sabor",
    kind: "flavor",
    min_selections: 0,
    max_selections: 1,
  },
  {
    key: "crust",
    name: "Borda",
    kind: "crust",
    min_selections: 0,
    max_selections: 1,
  },
  {
    key: "extra",
    name: "Adicionais",
    kind: "extra",
    min_selections: 0,
    max_selections: source.extraOptions.length,
  },
];
const optionGroups = groupDefs.map(({ key, ...group }) => ({
  id: id(`group:${key}`),
  store_id: storeId,
  ...group,
  active: true,
}));
const groupId = Object.fromEntries(
  optionGroups.map((group) => [group.kind, group.id]),
);
const flavorOptions = source.pizzas.map((pizza, display_order) => ({
  id: id(`option:flavor:${pizza.slug}`),
  option_group_id: groupId.flavor,
  store_id: storeId,
  name: pizza.name,
  additional_price_cents: 0,
  active: true,
  display_order,
}));
const otherOptions = [
  ...source.crustOptions.map((item, display_order) => ({
    ...item,
    kind: "crust",
    display_order,
  })),
  ...source.extraOptions.map((item, display_order) => ({
    ...item,
    kind: "extra",
    display_order,
  })),
].map(({ kind, display_order, name, additional_price_cents }) => ({
  id: id(`option:${kind}:${name}`),
  option_group_id: groupId[kind],
  store_id: storeId,
  name,
  additional_price_cents: requirePrice(additional_price_cents, name),
  active: true,
  display_order,
}));
const options = [...flavorOptions, ...otherOptions];
const productOptionRelations = pizzaProducts.flatMap((product) =>
  options
    .filter(
      (option) =>
        option.option_group_id !== groupId.flavor ||
        option.name !== product.name,
    )
    .map((option) => ({
      product_id: product.id,
      option_id: option.id,
      store_id: storeId,
    })),
);
const catalog = {
  categories,
  products,
  sizes,
  optionGroups,
  options,
  productOptionRelations,
  storeContact: { store_id: storeId, ...source.storeContact },
  storeHours: Array.from({ length: 7 }, (_, weekday) => ({
    store_id: storeId,
    weekday,
    opens_at: source.dailyHours.opens_at,
    closes_at: source.dailyHours.closes_at,
    closes_next_day: false,
  })),
};
writeFileSync(
  "src/data/demo-catalog.json",
  `${JSON.stringify(catalog, null, 2)}\n`,
);
console.log(
  `Cardápio gerado: ${pizzaProducts.length} pizzas, ${source.kalzones.length} kalzones, ${source.drinks.length} bebidas, ${sizes.length} tamanhos e ${options.length} opções.`,
);
