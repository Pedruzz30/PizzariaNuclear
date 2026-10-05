import { readFileSync, writeFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync("src/data/demo-catalog.json", "utf8"));
const store = "10000000-0000-4000-8000-000000000001";
const migrationPath = process.argv[2];
const literal = (value) =>
  value === null
    ? "null"
    : typeof value === "string"
      ? `'${value.replaceAll("'", "''")}'`
      : String(value);
const insert = (table, rows, conflict = "id") =>
  `insert into public.${table} (${Object.keys(rows[0]).join(",")}) values\n${rows
    .map((row) => `  (${Object.values(row).map(literal).join(",")})`)
    .join(",\n")}\non conflict (${conflict}) do nothing;`;
const entries = [
  ["categories", catalog.categories],
  ["products", catalog.products],
  ["product_sizes", catalog.sizes],
  ["option_groups", catalog.optionGroups],
  ["product_options", catalog.options],
  [
    "product_option_relations",
    catalog.productOptionRelations,
    "product_id,option_id",
  ],
];
const menuSql = entries
  .map(([table, rows, conflict]) => insert(table, rows, conflict))
  .join("\n\n");
const setupSql = `insert into public.stores(id,name,slug,active) values ('${store}','Nuclear — Homologação','nuclear-homologacao',true) on conflict(id) do nothing;
insert into public.store_settings(store_id) values ('${store}') on conflict(store_id) do nothing;`;

writeFileSync(
  "supabase/seed.sql",
  `-- HOMOLOGAÇÃO SOMENTE. Gerado por node scripts/generate-seed.mjs.
-- Não sobrescreve preços ou configurações de registros existentes.
begin;
${setupSql}
${menuSql}
commit;
`,
);

if (migrationPath) {
  const legacyProductIds = [
    "017c45b9-ba8a-5204-8b9f-9fdc8639225f",
    "071fa694-7a1a-5866-b11a-1824c20f0753",
    "3640e616-7a42-580d-8c5d-25af3af73c20",
    "806d2197-0d2b-5c3d-aa0b-c8215be484ec",
    "1ec2c784-6b8c-5975-9448-54754d213c40",
    "9f501222-903f-5236-be14-3b99d4523ad2",
    "e20a5e9e-32a5-5a3b-8e7c-26b29c4541d8",
    "7aaaa4be-d00d-5162-a3c9-af0e79c314c9",
    "89436efb-f936-52be-b63f-5437f007ed88",
    "5d3892bb-a832-5f1b-a3c8-4525983a93c7",
    "e990a476-26ce-58b4-ae16-ae389b4b3b6d",
    "e9dadcc9-ec64-5ad1-93d7-1f8bc57ea006",
    "3846e0ea-937f-5011-b500-7755b29e71b5",
    "6218d5aa-30c0-584a-85ca-a1352b5a4c1a",
  ];
  writeFileSync(
    migrationPath,
    `-- Cardápio informado para o projeto de homologação. Preserva os registros anteriores inativos.
begin;
update public.products
set slug = 'legacy-20261003-' || slug, active = false, available = false, featured = false
where store_id = '${store}' and id in (${legacyProductIds.map(literal).join(",")});
update public.categories set active = false
where store_id = '${store}' and slug in ('tradicionais','especiais','veganas','doces');
${setupSql}
${menuSql}
commit;
`,
  );
}
console.log(
  `Seed gerado: ${catalog.categories.length} categorias, ${catalog.products.length} produtos, ${catalog.sizes.length} tamanhos e ${catalog.options.length} opções.`,
);
