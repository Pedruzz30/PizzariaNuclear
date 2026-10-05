import { z } from "zod";
import type {
  Catalog,
  OptionGroup,
  ProductOption,
  ProductSize,
} from "./catalog-schema";

export const CART_KEY = "nuclear-cart-v3";
export const LEGACY_CART_KEY = "nuclear-cart-v2";
export const MAX_QUANTITY = 99;
export const MAX_NOTES_LENGTH = 280;

const lineSchema = z
  .object({
    productId: z.uuid(),
    sizeId: z.uuid().nullable(),
    optionIds: z.array(z.uuid()).max(30),
    notes: z.string().max(MAX_NOTES_LENGTH),
    quantity: z.number().int().min(1).max(MAX_QUANTITY),
  })
  .strict();
const persistedSchema = z
  .object({ version: z.literal(3), items: z.array(lineSchema).max(100) })
  .strict();
const legacySchema = z
  .object({
    version: z.literal(2),
    items: z
      .array(
        z
          .object({
            productId: z.uuid(),
            quantity: z.number().int().min(1).max(MAX_QUANTITY),
          })
          .strict(),
      )
      .max(100),
  })
  .strict();

export type CartLine = z.infer<typeof lineSchema>;
export type CartSelection = Omit<CartLine, "quantity">;
export type ProductChoiceGroup = OptionGroup & { options: ProductOption[] };
export type ResolvedCartLine = CartLine & {
  key: string;
  product: Catalog["products"][number];
  size: ProductSize | null;
  options: ProductOption[];
  flavorOption: ProductOption | null;
  unitPriceCents: number;
  lineTotalCents: number;
};
export type CartAction =
  | { type: "hydrate"; items: CartLine[] }
  | { type: "add"; line: CartSelection }
  | { type: "quantity"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

function normalizeLine(line: CartLine): CartLine | null {
  if (new Set(line.optionIds).size !== line.optionIds.length) return null;
  return {
    ...line,
    optionIds: [...line.optionIds].sort(),
    notes: line.notes.trim(),
  };
}

export function cartLineKey(line: CartSelection) {
  return JSON.stringify([
    line.productId,
    line.sizeId,
    [...line.optionIds].sort(),
    line.notes.trim(),
  ]);
}

export function parseCart(raw: string | null): CartLine[] {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    const current = persistedSchema.safeParse(value);
    let parsed: CartLine[];
    if (current.success) {
      parsed = current.data.items;
    } else {
      const legacy = legacySchema.safeParse(value);
      if (!legacy.success) return [];
      parsed = legacy.data.items.map((item) => ({
        ...item,
        sizeId: null,
        optionIds: [],
        notes: "",
      }));
    }
    const items = parsed.map(normalizeLine);
    if (items.some((item) => item === null)) return [];
    const valid = items as CartLine[];
    return new Set(valid.map(cartLineKey)).size === valid.length ? valid : [];
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
      return items.filter((item) => cartLineKey(item) !== action.key);
    case "quantity":
      if (
        !Number.isInteger(action.quantity) ||
        action.quantity > MAX_QUANTITY ||
        action.quantity < 0
      )
        return items;
      return action.quantity === 0
        ? items.filter((item) => cartLineKey(item) !== action.key)
        : items.map((item) =>
            cartLineKey(item) === action.key
              ? { ...item, quantity: action.quantity }
              : item,
          );
    case "add": {
      const result = lineSchema.safeParse({ ...action.line, quantity: 1 });
      if (!result.success) return items;
      const line = normalizeLine(result.data);
      if (!line) return items;
      const key = cartLineKey(line);
      const existing = items.find((item) => cartLineKey(item) === key);
      if (existing)
        return items.map((item) =>
          item === existing
            ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) }
            : item,
        );
      return items.length >= 100 ? items : [...items, line];
    }
  }
}

export function getProductChoices(catalog: Catalog, productId: string) {
  const product = catalog.products.find((item) => item.id === productId);
  if (!product) return { sizes: [], groups: [] as ProductChoiceGroup[] };
  const sizes = catalog.sizes
    .filter((item) => item.product_id === productId && item.active)
    .sort((a, b) => a.display_order - b.display_order);
  const allowedIds = new Set(
    catalog.productOptionRelations
      .filter(
        (item) =>
          item.product_id === productId && item.store_id === product.store_id,
      )
      .map((item) => item.option_id),
  );
  const groups = catalog.optionGroups
    .filter((group) => group.store_id === product.store_id && group.active)
    .sort(
      (a, b) =>
        ["flavor", "crust", "extra", "preparation"].indexOf(a.kind) -
        ["flavor", "crust", "extra", "preparation"].indexOf(b.kind),
    )
    .map((group) => ({
      ...group,
      options: catalog.options
        .filter(
          (option) =>
            option.option_group_id === group.id &&
            option.store_id === product.store_id &&
            option.active &&
            allowedIds.has(option.id),
        )
        .sort((a, b) => a.display_order - b.display_order),
    }))
    .filter((group) => group.options.length > 0);
  return { sizes, groups };
}

// Valores de exibição: preços do navegador nunca autorizam cobrança.
export function resolveCart(
  items: CartLine[],
  catalog: Catalog,
): ResolvedCartLine[] {
  const byId = new Map(
    catalog.products.map((product) => [product.id, product]),
  );
  return items.flatMap((line) => {
    const product = byId.get(line.productId);
    if (!product?.active || !product.available) return [];
    if (new Set(line.optionIds).size !== line.optionIds.length) return [];
    const { sizes, groups } = getProductChoices(catalog, line.productId);
    const size = sizes.find((item) => item.id === line.sizeId) ?? null;
    if (sizes.length ? !size : line.sizeId !== null) return [];
    const options = groups.flatMap((group) => group.options);
    const selected = line.optionIds.map((id) =>
      options.find((option) => option.id === id),
    );
    if (selected.some((option) => !option)) return [];
    if (
      groups.some((group) => {
        const count = group.options.filter((option) =>
          line.optionIds.includes(option.id),
        ).length;
        return count < group.min_selections || count > group.max_selections;
      })
    )
      return [];
    const unitPriceCents =
      (size?.price_cents ?? product.base_price_cents) +
      selected.reduce(
        (sum, option) => sum + (option?.additional_price_cents ?? 0),
        0,
      );
    return [
      {
        ...line,
        key: cartLineKey(line),
        product,
        size,
        options: selected as ProductOption[],
        flavorOption:
          selected.find((option) =>
            groups.some(
              (group) =>
                group.kind === "flavor" && group.id === option?.option_group_id,
            ),
          ) ?? null,
        unitPriceCents,
        lineTotalCents: unitPriceCents * line.quantity,
      },
    ];
  });
}
