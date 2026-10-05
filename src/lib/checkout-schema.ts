import { z } from "zod";
import { MAX_NOTES_LENGTH, MAX_QUANTITY } from "./cart";

export const checkoutInputSchema = z
  .object({
    idempotencyKey: z.uuid(),
    customerName: z.string().trim().min(2).max(120),
    customerPhone: z
      .string()
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().regex(/^\d{10,11}$/)),
    customerEmail: z
      .union([z.email().max(254), z.literal("")])
      .transform((value) => value || null),
    orderType: z.enum(["pickup", "delivery"]),
    customerNotes: z.string().trim().max(1000).default(""),
    address: z
      .object({
        cep: z
          .string()
          .transform((value) => value.replace(/\D/g, ""))
          .pipe(z.string().regex(/^\d{8}$/)),
        street: z.string().trim().min(2).max(120),
        number: z.string().trim().min(1).max(20),
        complement: z.string().trim().max(120).default(""),
        neighborhood: z.string().trim().min(2).max(120),
        city: z.string().trim().min(2).max(120),
        state: z
          .string()
          .trim()
          .length(2)
          .transform((value) => value.toUpperCase()),
        reference: z.string().trim().max(120).default(""),
      })
      .strict()
      .nullable(),
    items: z
      .array(
        z
          .object({
            productId: z.uuid(),
            sizeId: z.uuid().nullable(),
            optionIds: z.array(z.uuid()).max(30),
            notes: z.string().trim().max(MAX_NOTES_LENGTH),
            quantity: z.number().int().min(1).max(MAX_QUANTITY),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict()
  .refine(
    (value) =>
      value.orderType === "delivery"
        ? value.address !== null
        : value.address === null,
    {
      message: "Endereço incompatível com a modalidade escolhida.",
      path: ["address"],
    },
  );

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
