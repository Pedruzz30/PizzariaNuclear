import "server-only";
import { getCatalogSource, getStoreId } from "./env";
import { createCatalogClient } from "./supabase";

export type DeliveryZone = {
  name: string;
  cep: string;
  city: string;
  state: string;
  feeCents: number;
};

const demoZones: DeliveryZone[] = [
  {
    name: "Centro",
    cep: "27475000",
    city: "Rio Claro",
    state: "RJ",
    feeCents: 500,
  },
  {
    name: "Estação",
    cep: "27475000",
    city: "Rio Claro",
    state: "RJ",
    feeCents: 600,
  },
  {
    name: "Morro do Querosene",
    cep: "27475000",
    city: "Rio Claro",
    state: "RJ",
    feeCents: 400,
  },
  {
    name: "Itaoca",
    cep: "27475000",
    city: "Rio Claro",
    state: "RJ",
    feeCents: 800,
  },
  {
    name: "Passa Quatro",
    cep: "27475000",
    city: "Rio Claro",
    state: "RJ",
    feeCents: 900,
  },
];

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  if (getCatalogSource() === "demo") return demoZones;
  const db = createCatalogClient();
  const { data, error } = await db
    .from("delivery_zones")
    .select("name,cep_start,cep_end,city,state,fee_cents")
    .eq("store_id", getStoreId())
    .eq("active", true)
    .order("name");
  if (error) {
    console.error("delivery_zones_read_failed", { code: error.code });
    return [];
  }
  return (data ?? [])
    .filter((zone) => zone.cep_start === zone.cep_end)
    .map((zone) => ({
      name: zone.name,
      cep: zone.cep_start,
      city: zone.city,
      state: zone.state.trim(),
      feeCents: zone.fee_cents,
    }));
}
