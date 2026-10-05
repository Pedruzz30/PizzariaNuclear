import { z } from "zod";

export const categorySchema = z.object({
  id: z.uuid(),
  store_id: z.uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  display_order: z.number().int(),
  active: z.boolean(),
});
export const productSchema = z.object({
  id: z.uuid(),
  store_id: z.uuid(),
  category_id: z.uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  image_url: z.string().nullable(),
  base_price_cents: z.number().int().min(0).max(100_000_000),
  active: z.boolean(),
  available: z.boolean(),
  featured: z.boolean(),
  display_order: z.number().int(),
  tag: z.string(),
});
export const productSizeSchema = z.object({
  id: z.uuid(),
  product_id: z.uuid(),
  name: z.string().min(1),
  price_cents: z.number().int().min(0).max(100_000_000),
  active: z.boolean(),
  display_order: z.number().int(),
});
export const optionGroupSchema = z.object({
  id: z.uuid(),
  store_id: z.uuid(),
  name: z.string().min(1),
  kind: z.enum(["crust", "extra", "preparation", "flavor"]),
  min_selections: z.number().int().min(0),
  max_selections: z.number().int().min(1).max(30),
  active: z.boolean(),
});
export const productOptionSchema = z.object({
  id: z.uuid(),
  option_group_id: z.uuid(),
  store_id: z.uuid(),
  name: z.string().min(1),
  additional_price_cents: z.number().int().min(0).max(100_000_000),
  active: z.boolean(),
  display_order: z.number().int(),
});
export const productOptionRelationSchema = z.object({
  product_id: z.uuid(),
  option_id: z.uuid(),
  store_id: z.uuid(),
});
export const storeContactSchema = z.object({
  store_id: z.uuid(),
  phone: z.string(),
  whatsapp: z.string(),
  address: z.string(),
});
export const storeHoursSchema = z.object({
  store_id: z.uuid(),
  weekday: z.number().int().min(0).max(6),
  opens_at: z.string(),
  closes_at: z.string(),
  closes_next_day: z.boolean(),
});
export const catalogSchema = z.object({
  categories: z.array(categorySchema),
  products: z.array(productSchema),
  sizes: z.array(productSizeSchema).default([]),
  optionGroups: z.array(optionGroupSchema).default([]),
  options: z.array(productOptionSchema).default([]),
  productOptionRelations: z.array(productOptionRelationSchema).default([]),
  storeContact: storeContactSchema.nullable().default(null),
  storeHours: z.array(storeHoursSchema).default([]),
});
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductSize = z.infer<typeof productSizeSchema>;
export type OptionGroup = z.infer<typeof optionGroupSchema>;
export type ProductOption = z.infer<typeof productOptionSchema>;
export type StoreContact = z.infer<typeof storeContactSchema>;
export type StoreHours = z.infer<typeof storeHoursSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

export function getStartingPrice(product: Product, sizes: ProductSize[] = []) {
  const prices = sizes
    .filter((size) => size.product_id === product.id && size.active)
    .map((size) => size.price_cents);
  return {
    cents: prices.length ? Math.min(...prices) : product.base_price_cents,
    hasSizes: prices.length > 0,
  };
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
