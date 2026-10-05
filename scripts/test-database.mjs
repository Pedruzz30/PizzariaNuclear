// Runs the real PostgreSQL engine in WebAssembly, isolated in memory.
// Validates SQL/RLS, not the Supabase Auth or PostgREST services.
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const engine = new PGlite();
const db = {
  async query(sql, params) {
    if (params) return engine.query(sql, params);
    const results = await engine.exec(sql);
    return results.at(-1) ?? { rows: [] };
  },
};
try {
  // Minimal Supabase Auth contract for SQL policy tests, NOT an Auth server.
  for (const role of ["anon", "authenticated", "service_role"]) {
    const found = await db.query("select 1 from pg_roles where rolname=$1", [
      role,
    ]);
    if (!found.rows.length)
      await db.query(
        `create role ${role} nologin ${role === "service_role" ? "bypassrls" : ""}`,
      );
  }
  await db.query(`create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated,service_role;`);
  for (const migration of readdirSync("supabase/migrations")
    .filter((file) => file.endsWith(".sql"))
    .sort()) {
    await db.query(
      readFileSync(join("supabase/migrations", migration), "utf8"),
    );
  }
  const seed = readFileSync("supabase/seed.sql", "utf8");
  await db.query(seed);
  await db.query(seed);
  const check = async (sql, expected) =>
    assert.equal((await db.query(sql)).rows[0].n, expected, sql);
  await check("select count(*)::int n from products", 28);
  await check("select count(*)::int n from categories", 3);
  await check("select count(*)::int n from product_sizes", 84);
  await check("select count(*)::int n from option_groups", 3);
  await check("select count(*)::int n from product_options", 29);
  await check("select count(*)::int n from product_option_relations", 588);
  await check(
    "select count(*)::int n from store_hours where opens_at='17:00' and closes_at='23:00'",
    7,
  );
  await check(
    "select count(*)::int n from store_settings where whatsapp='5524999192282' and phone='(24) 99919-2282'",
    1,
  );
  await check(
    "select count(*)::int n from products where category_id=(select id from categories where slug='pizzas')",
    21,
  );
  await check(
    "select count(*)::int n from products where category_id=(select id from categories where slug='kalzones')",
    2,
  );
  await check(
    "select count(*)::int n from products where category_id=(select id from categories where slug='bebidas')",
    5,
  );
  await check(
    "select count(*)::int n from product_sizes where price_cents not in (5000,5500,6500,7000)",
    0,
  );
  await check(
    "select count(*)::int n from product_option_relations where product_id in (select id from products where category_id in (select id from categories where slug in ('kalzones','bebidas')))",
    0,
  );
  await check(
    "select count(*)::int n from pg_tables where schemaname='public' and not rowsecurity",
    0,
  );
  await check(
    "select count(*)::int n from store_settings where ordering_enabled",
    0,
  );
  console.log(
    "PASS migration, seed idempotente, 21 tabelas com RLS, pedidos desabilitados",
  );

  async function denied(sql, code = "42501") {
    await db.query("savepoint denied");
    try {
      await db.query(sql);
      assert.fail(`Operação deveria falhar: ${sql}`);
    } catch (error) {
      assert.equal(error.code, code, `${sql}: ${error.message}`);
    } finally {
      await db.query("rollback to savepoint denied");
    }
  }
  for (const role of ["anon", "authenticated"]) {
    await db.query(`begin; set local role ${role}`);
    await check("select count(*)::int n from products", 28);
    await denied("update products set base_price_cents=1");
    for (const table of [
      "customers",
      "customer_addresses",
      "orders",
      "order_items",
      "order_item_options",
      "payments",
      "order_events",
      "order_access_tokens",
      "checkout_requests",
      "webhook_events",
    ])
      await denied(`select * from ${table}`);
    await denied(
      "insert into staff_members(user_id,store_id) values ('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001')",
    );
    await db.query("rollback");
  }
  console.log(
    "PASS anon/autenticado não leem dados privados, alteram preços ou atribuem ADMIN",
  );
  await db.query(
    "begin; update products set active=false where slug='margherita'; set local role anon",
  );
  await check("select count(*)::int n from products", 27);
  await db.query("rollback");
  await db.query(
    "begin; update categories set active=false where slug='pizzas'; set local role anon",
  );
  await check("select count(*)::int n from products", 7);
  await db.query("rollback");
  await db.query("begin; update stores set active=false; set local role anon");
  await check("select count(*)::int n from products", 0);
  await db.query("rollback");
  console.log("PASS visibilidade de produto/categoria/unidade inativos");

  await db.query("begin");
  await denied("update products set base_price_cents=-1", "23514");
  await denied("update products set category_id=gen_random_uuid()", "23503");
  await denied(
    "insert into orders(store_id,customer_name,customer_phone,order_type,subtotal_cents,total_cents,payment_method,delivery_fee_cents) values ('10000000-0000-4000-8000-000000000001','Teste','31999999999','pickup',100,110,'cash',10)",
    "23514",
  );
  await db.query("rollback");
  console.log("PASS constraints de preço, FK e retirada sem taxa");

  await db.query(`begin;
    insert into auth.users(id) values ('10000000-0000-4000-8000-000000000002'),('10000000-0000-4000-8000-000000000003');
    insert into staff_members(user_id,store_id) select id,'10000000-0000-4000-8000-000000000001' from auth.users;
    set local role authenticated;
    select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);`);
  await check("select count(*)::int n from staff_members", 1);
  await db.query("rollback");
  console.log("PASS equipe só pode ler seu próprio vínculo");
  await db.query("begin; set local role service_role");
  await db.query("update products set tag='Teste' where slug='margherita'");
  await db.query("rollback");
  console.log("PASS acesso de serviço e trigger sem SECURITY DEFINER");

  const choiceRows = await db.query(`
    select p.id product_id,ps.id size_id,
      (select o.id from product_options o where o.name='Calabresa' and o.option_group_id=(select id from option_groups where kind='flavor')) flavor_id,
      (select id from product_options where name='Borda de Catupiry') crust_id,
      (select id from product_options where name='Milho') extra_id
    from products p join product_sizes ps on ps.product_id=p.id and ps.name='Pequena'
    where p.slug='mussarela'`);
  const choice = choiceRows.rows[0];
  const checkoutItems = JSON.stringify([
    {
      productId: choice.product_id,
      sizeId: choice.size_id,
      optionIds: [choice.flavor_id, choice.crust_id, choice.extra_id],
      notes: "Sem cebola",
      quantity: 1,
    },
  ]);
  const checkoutSql = `select public.create_checkout_order(
    '10000000-0000-4000-8000-000000000001',$1,
    '10000000-0000-4000-8000-000000000090',$2,
    'Cliente Teste','24999999999',null,'pickup','', $3::jsonb,null) result`;
  await db.query("begin; set local role anon");
  await denied(
    `select public.create_checkout_order('10000000-0000-4000-8000-000000000001',repeat('a',64),'10000000-0000-4000-8000-000000000090',repeat('b',64),'Teste','24999999999',null,'pickup','', '[]'::jsonb,null)`,
  );
  await db.query("rollback");
  await db.query("begin; set local role service_role");
  await db.query("savepoint disabled_checkout");
  try {
    await db.query(checkoutSql, [
      "a".repeat(64),
      "b".repeat(64),
      checkoutItems,
    ]);
    assert.fail("Checkout desabilitado deveria falhar");
  } catch (error) {
    assert.equal(error.code, "P0001");
  } finally {
    await db.query("rollback to savepoint disabled_checkout");
  }
  await db.query("rollback");
  await db.query("begin");
  await db.query(
    "update store_settings set ordering_enabled=true,opening_override='open' ",
  );
  await db.query("set local role service_role");
  const args = ["a".repeat(64), "b".repeat(64), checkoutItems];
  const created = (await db.query(checkoutSql, args)).rows[0].result;
  assert.equal(created.existing, false);
  const duplicate = (await db.query(checkoutSql, args)).rows[0].result;
  assert.equal(duplicate.existing, true);
  assert.equal(duplicate.order_id, created.order_id);
  await check("select total_cents::int n from orders", 5500);
  await check("select count(*)::int n from order_items", 1);
  await check("select count(*)::int n from order_item_options", 3);
  await db.query(
    "select public.record_checkout_preference($1::uuid,'pref-1','https://sandbox.mercadopago.com/checkout/pay?id=1')",
    [created.payment_id],
  );
  await check(
    "select count(*)::int n from payments where provider_order_id='pref-1'",
    1,
  );
  await denied(
    checkoutSql
      .replace("$2", "repeat('c',64)")
      .replace("$1", "repeat('a',64)")
      .replace("$3::jsonb", `'${checkoutItems}'::jsonb`),
    "22023",
  );
  const applySql = (eventId, paymentId, status) =>
    `select public.apply_verified_payment(
      '${eventId}','${paymentId}',$1::uuid,$2,'BRL','${status}','pix',false) result`;
  await db.query("savepoint amount_mismatch");
  try {
    await db.query(applySql("event-1", "123456789", "approved"), [
      created.order_id,
      1,
    ]);
    assert.fail("Pagamento com valor diferente deveria falhar");
  } catch (error) {
    assert.equal(error.code, "22023");
  } finally {
    await db.query("rollback to savepoint amount_mismatch");
  }
  const apply = async (eventId, paymentId, status) =>
    (
      await db.query(applySql(eventId, paymentId, status), [
        created.order_id,
        5500,
      ])
    ).rows[0].result;
  await apply("return:123456789:pending", "123456789", "pending");
  await apply("webhook:rejected", "123456789", "rejected");
  await check(
    "select count(*)::int n from orders where payment_status='rejected' and order_status='cancelled'",
    1,
  );
  await apply("return:987654321:pending", "987654321", "pending");
  await check(
    "select count(*)::int n from orders where payment_status='pending' and order_status='awaiting_payment'",
    1,
  );
  const applied = await apply(
    "return:987654321:approved",
    "987654321",
    "approved",
  );
  assert.equal(applied.payment_status, "approved");
  const appliedAgain = await apply(
    "return:987654321:approved",
    "987654321",
    "approved",
  );
  assert.equal(appliedAgain.duplicate, true);
  const otherRefund = await apply(
    "webhook:other-refund",
    "123456789",
    "refunded",
  );
  assert.equal(otherRefund.ignored, true);
  await check(
    "select count(*)::int n from orders where payment_status='approved' and order_status='confirmed'",
    1,
  );
  const refund = await apply("webhook:correct-refund", "987654321", "refunded");
  assert.equal(refund.payment_status, "refunded");
  await check(
    "select count(*)::int n from orders where payment_status='refunded'",
    1,
  );
  await check("select count(*)::int n from webhook_events", 6);
  await db.query("rollback");
  console.log(
    "PASS checkout transacional, preço do banco, idempotência e confirmação verificada",
  );

  if (process.argv.includes("--generate-types")) {
    const columns = (
      await db.query(
        `select table_name,column_name,data_type,is_nullable,column_default,is_identity from information_schema.columns where table_schema='public' order by table_name,ordinal_position`,
      )
    ).rows;
    const tables = [...new Set(columns.map((c) => c.table_name))];
    const type = (c) =>
      (["integer", "smallint", "bigint", "numeric"].includes(c.data_type)
        ? "number"
        : c.data_type === "boolean"
          ? "boolean"
          : c.data_type === "jsonb"
            ? "Json"
            : "string") + (c.is_nullable === "YES" ? " | null" : "");
    const shape = (table, mode) =>
      columns
        .filter((c) => c.table_name === table)
        .map(
          (c) =>
            `${c.column_name}${mode === "Update" || (mode === "Insert" && (c.is_nullable === "YES" || c.column_default || c.is_identity === "YES")) ? "?" : ""}: ${c.is_identity === "YES" && mode !== "Row" ? "never" : type(c)};`,
        )
        .join("\n");
    const output =
      "// Generated from the migrated PostgreSQL test engine. Do not edit manually.\nexport type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\nexport type Database = { public: { Tables: {\n" +
      tables
        .map(
          (table) =>
            `${table}: { Row: {${shape(table, "Row")}}; Insert: {${shape(table, "Insert")}}; Update: {${shape(table, "Update")}}; Relationships: [] };`,
        )
        .join("\n") +
      "\n}; Views: { [_ in never]: never }; Functions: { [_ in never]: never }; Enums: { [_ in never]: never }; CompositeTypes: { [_ in never]: never } } };\n";
    writeFileSync("src/types/database.generated.ts", output);
    console.log(
      "PASS tipos TypeScript gerados por introspecção do schema real",
    );
  }
} finally {
  await engine.close();
}
