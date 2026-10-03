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
export const catalogSchema = z.object({
  categories: z.array(categorySchema),
  products: z.array(productSchema),
});
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type Catalog = z.infer<typeof catalogSchema>;

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}
