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
  const [categories, products] = await Promise.all([
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
  ]);
  if (categories.error || products.error) {
    // Não registra headers, tokens nem payload do provedor.
    console.error("catalog_read_failed", {
      code: categories.error?.code ?? products.error?.code,
    });
    throw new Error("Não foi possível carregar o cardápio. Tente novamente.");
  }
  const catalog = catalogSchema.parse({
    categories: categories.data,
    products: products.data,
  });
  const categoryIds = new Set(
    catalog.categories.map((category) => category.id),
  );
  return {
    ...catalog,
    products: catalog.products.filter((product) =>
      categoryIds.has(product.category_id),
    ),
    source,
  };
});
