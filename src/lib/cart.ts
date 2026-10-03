import { z } from "zod";
import type { Product } from "./catalog-schema";

export const CART_KEY = "nuclear-cart-v2";
export const MAX_QUANTITY = 99;
const lineSchema = z
  .object({
    productId: z.uuid(),
    quantity: z.number().int().min(1).max(MAX_QUANTITY),
  })
  .strict();
const persistedSchema = z
  .object({ version: z.literal(2), items: z.array(lineSchema).max(100) })
  .strict();
export type CartLine = z.infer<typeof lineSchema>;
export type CartAction =
  | { type: "hydrate"; items: CartLine[] }
  | { type: "add"; productId: string }
  | { type: "quantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export function parseCart(raw: string | null): CartLine[] {
  try {
    const parsed = persistedSchema.safeParse(JSON.parse(raw ?? "null"));
    if (!parsed.success) return [];
    const ids = new Set(parsed.data.items.map((line) => line.productId));
    return ids.size === parsed.data.items.length ? parsed.data.items : [];
  } catch {
    return [];
  }
}

export function cartReducer(items: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.items;
    case "clear":
      return [];
    case "remove":
      return items.filter((item) => item.productId !== action.productId);
    case "quantity":
      if (
        !Number.isInteger(action.quantity) ||
        action.quantity > MAX_QUANTITY ||
        action.quantity < 0
      )
        return items;
      return action.quantity === 0
        ? items.filter((item) => item.productId !== action.productId)
        : items.map((item) =>
            item.productId === action.productId
              ? { ...item, quantity: action.quantity }
              : item,
          );
    case "add": {
      const existing = items.find(
        (item) => item.productId === action.productId,
      );
      if (existing)
        return items.map((item) =>
          item === existing
            ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) }
            : item,
        );
      return items.length >= 100
        ? items
        : [...items, { productId: action.productId, quantity: 1 }];
    }
  }
}

// Valores de exibição: nunca autorizam cobrança. Não existem preços persistidos no navegador.
export function resolveCart(items: CartLine[], products: Product[]) {
  const byId = new Map(products.map((product) => [product.id, product]));
  return items
    .map((line) => ({ ...line, product: byId.get(line.productId) }))
    .filter((line): line is CartLine & { product: Product } =>
      Boolean(line.product?.active && line.product.available),
    );
}
