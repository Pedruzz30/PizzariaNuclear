import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const storeId = process.env.STORE_ID;
const expectedRef = "vtadejzspvolvhkcvvxv";
if (
  !url ||
  !key ||
  !storeId ||
  new URL(url).hostname !== `${expectedRef}.supabase.co`
) {
  throw new Error(
    "Configure o projeto Supabase de teste esperado antes de inspecionar.",
  );
}
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const tables = [
  "categories",
  "products",
  "product_sizes",
  "option_groups",
  "product_options",
  "product_option_relations",
  "store_hours",
];
const counts = {};
for (const table of tables) {
  const column = table === "product_sizes" ? "product_id" : "store_id";
  let query = db.from(table).select("*", { count: "exact", head: true });
  if (column === "store_id") query = query.eq(column, storeId);
  const result = await query;
  if (result.error)
    throw new Error(`${table}: ${result.error.code || result.error.message}`);
  counts[table] = result.count;
}
const { data: store, error: storeError } = await db
  .from("stores")
  .select("name,slug,active")
  .eq("id", storeId)
  .single();
if (storeError)
  throw new Error(`stores: ${storeError.code || storeError.message}`);
assert.equal(store.slug, "nuclear-homologacao");
assert.deepEqual(counts, {
  categories: 3,
  products: 28,
  product_sizes: 84,
  option_groups: 3,
  product_options: 29,
  product_option_relations: 588,
  store_hours: 7,
});
const { data: contact, error: contactError } = await db
  .from("store_settings")
  .select(
    "phone,whatsapp,address,ordering_enabled,pickup_enabled,delivery_enabled,pix_enabled,card_enabled",
  )
  .eq("store_id", storeId)
  .single();
if (contactError)
  throw new Error(
    `store_settings: ${contactError.code || contactError.message}`,
  );
assert.equal(contact.whatsapp, "5524999192282");
assert.equal(contact.ordering_enabled, false);
assert.equal(contact.pickup_enabled, true);
assert.equal(contact.delivery_enabled, false);
assert.equal(contact.pix_enabled, true);
assert.equal(contact.card_enabled, true);
const checkoutProbe = await db.rpc("create_checkout_order", {
  p_store_id: storeId,
  p_session_hash: "a".repeat(64),
  p_idempotency_key: "10000000-0000-4000-8000-000000000090",
  p_payload_hash: "b".repeat(64),
  p_customer_name: "Teste",
  p_customer_phone: "24999999999",
  p_customer_email: null,
  p_order_type: "pickup",
  p_customer_notes: "",
  p_items: [],
  p_address: null,
});
assert.equal(checkoutProbe.data, null);
assert.equal(checkoutProbe.error?.code, "42501");
const { data: products, error: productsError } = await db
  .from("products")
  .select("id,slug,base_price_cents")
  .eq("store_id", storeId)
  .in("slug", [
    "mussarela",
    "kalzone-de-pizza",
    "kalzone-de-frango",
    "coca-cola-2l",
    "guaravita",
  ]);
if (productsError)
  throw new Error(`products: ${productsError.code || productsError.message}`);
const prices = Object.fromEntries(
  products.map((product) => [product.slug, product.base_price_cents]),
);
assert.deepEqual(prices, {
  mussarela: 5000,
  "kalzone-de-pizza": 2500,
  "kalzone-de-frango": 3000,
  "coca-cola-2l": 1400,
  guaravita: 400,
});
const pizzaId = products.find((product) => product.slug === "mussarela").id;
const { data: sizes, error: sizesError } = await db
  .from("product_sizes")
  .select("name,price_cents")
  .eq("product_id", pizzaId);
if (sizesError)
  throw new Error(`product_sizes: ${sizesError.code || sizesError.message}`);
assert.deepEqual(
  Object.fromEntries(sizes.map((size) => [size.name, size.price_cents])),
  { Pequena: 5000, Média: 5500, Grande: 6500, Maracanã: 7000 },
);
console.log(
  JSON.stringify(
    { project: expectedRef, store, counts, contact, prices, sizes },
    null,
    2,
  ),
);
