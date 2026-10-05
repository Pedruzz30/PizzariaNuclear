import "server-only";
import { cache } from "react";
import { catalogSchema } from "@/lib/catalog-schema";
import { getCatalogSource, getStoreId } from "./env";
import { createCatalogClient } from "./supabase";

export const getCatalog = cache(async () => {
  const source = getCatalogSource();
  if (source === "demo") {
    const { default: fixture } = await import("@/data/demo-catalog.json");
    return { ...catalogSchema.parse(fixture), source };
  }
  const db = createCatalogClient();
  const storeId = getStoreId();
  const [categories, products, contact, hours] = await Promise.all([
    db
      .from("categories")
      .select("id,store_id,name,slug,display_order,active")
      .eq("store_id", storeId)
      .eq("active", true)
      .order("display_order")
      .order("name"),
    db
      .from("products")
      .select(
        "id,store_id,category_id,name,slug,description,image_url,base_price_cents,active,available,featured,display_order,tag",
      )
      .eq("store_id", storeId)
      .eq("active", true)
      .order("display_order")
      .order("name"),
    db
      .from("store_settings")
      .select("store_id,phone,whatsapp,address")
      .eq("store_id", storeId)
      .maybeSingle(),
    db
      .from("store_hours")
      .select("store_id,weekday,opens_at,closes_at,closes_next_day")
      .eq("store_id", storeId)
      .order("weekday"),
  ]);
  if (categories.error || products.error || contact.error || hours.error) {
    // Não registra headers, tokens nem payload do provedor.
    console.error("catalog_read_failed", {
      code:
        categories.error?.code ??
        products.error?.code ??
        contact.error?.code ??
        hours.error?.code,
    });
    throw new Error("Não foi possível carregar o cardápio. Tente novamente.");
  }
  const catalog = catalogSchema.parse({
    categories: categories.data,
    products: products.data,
    storeContact: contact.data,
    storeHours: hours.data,
  });
  const categoryIds = new Set(
    catalog.categories.map((category) => category.id),
  );
  const visibleProducts = catalog.products.filter((product) =>
    categoryIds.has(product.category_id),
  );
  if (!visibleProducts.length) {
    return { ...catalog, products: visibleProducts, source };
  }
  const productIds = visibleProducts.map((product) => product.id);
  const [sizes, groups, options, relations] = await Promise.all([
    db
      .from("product_sizes")
      .select("id,product_id,name,price_cents,active,display_order")
      .in("product_id", productIds)
      .eq("active", true)
      .order("display_order"),
    db
      .from("option_groups")
      .select("id,store_id,name,kind,min_selections,max_selections,active")
      .eq("store_id", storeId)
      .eq("active", true),
    db
      .from("product_options")
      .select(
        "id,option_group_id,store_id,name,additional_price_cents,active,display_order",
      )
      .eq("store_id", storeId)
      .eq("active", true)
      .order("display_order"),
    db
      .from("product_option_relations")
      .select("product_id,option_id,store_id")
      .eq("store_id", storeId)
      .in("product_id", productIds),
  ]);
  const optionError =
    sizes.error ?? groups.error ?? options.error ?? relations.error;
  if (optionError) {
    console.error("catalog_options_read_failed", { code: optionError.code });
    throw new Error("Não foi possível carregar as opções do cardápio.");
  }
  return {
    ...catalogSchema.parse({
      categories: catalog.categories,
      products: visibleProducts,
      sizes: sizes.data,
      optionGroups: groups.data,
      options: options.data,
      productOptionRelations: relations.data,
      storeContact: contact.data,
      storeHours: hours.data,
    }),
    source,
  };
});
