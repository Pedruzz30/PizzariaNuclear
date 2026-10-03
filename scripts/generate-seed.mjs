import { readFileSync, writeFileSync } from "node:fs";
const catalog = JSON.parse(readFileSync("src/data/demo-catalog.json", "utf8"));
const store = "10000000-0000-4000-8000-000000000001";
const literal = (value) =>
  value === null
    ? "null"
    : typeof value === "string"
      ? `'${value.replaceAll("'", "''")}'`
      : String(value);
const inserts = (table, rows) =>
  rows
    .map(
      (row) =>
        `insert into public.${table} (${Object.keys(row).join(",")}) values (${Object.values(row).map(literal).join(",")}) on conflict (id) do nothing;`,
    )
    .join("\n");
writeFileSync(
  "supabase/seed.sql",
  `-- HOMOLOGAÇÃO SOMENTE. Gerado por node scripts/generate-seed.mjs.
-- Nunca sobrescreve preços/configurações de registros existentes.
begin;
insert into public.stores(id,name,slug,active) values ('${store}','Nuclear — Homologação','nuclear-homologacao',true) on conflict(id) do nothing;
insert into public.store_settings(store_id) values ('${store}') on conflict(store_id) do nothing;
${inserts("categories", catalog.categories)}
${inserts("products", catalog.products)}
commit;
`,
);
console.log(
  "Seed de homologação gerado: 4 categorias, 14 produtos, loja fechada para pedidos.",
);
