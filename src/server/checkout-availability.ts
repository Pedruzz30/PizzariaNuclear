import "server-only";
import { getOrderDatabase } from "./orders";

export type CheckoutAvailability = { pickup: boolean; delivery: boolean };

export async function getCheckoutAvailability(): Promise<CheckoutAvailability> {
  const connection = getOrderDatabase();
  if (!connection) return { pickup: false, delivery: false };
  const { data, error } = await connection.db
    .from("store_settings")
    .select(
      "ordering_enabled,pickup_enabled,delivery_enabled,pix_enabled,card_enabled",
    )
    .eq("store_id", connection.config.storeId)
    .maybeSingle();
  if (
    error ||
    !data?.ordering_enabled ||
    !data.pix_enabled ||
    !data.card_enabled
  ) {
    return { pickup: false, delivery: false };
  }
  return { pickup: data.pickup_enabled, delivery: data.delivery_enabled };
}
