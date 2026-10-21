"use client";

import { useRef, useState, type FormEvent } from "react";
import type { CartLine } from "@/lib/cart";
import type { CheckoutAvailability } from "@/server/checkout-availability";
import type { DeliveryZone } from "@/server/delivery-zones";
import { formatPrice } from "@/lib/catalog-schema";

export function CheckoutForm({
  items,
  availability,
  deliveryZones,
  subtotalCents,
}: {
  items: CartLine[];
  availability: CheckoutAvailability;
  deliveryZones: DeliveryZone[];
  subtotalCents: number;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const retry = useRef<{ fingerprint: string; key: string } | null>(null);
  const selectedZone = deliveryZones.find((zone) => zone.name === neighborhood);
  const canCheckout =
    orderType === "pickup" ? availability.pickup : availability.delivery;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !canCheckout ||
      !items.length ||
      busy ||
      (orderType === "delivery" && !selectedZone)
    )
      return;
    setBusy(true);
    setError("");
    const order = {
      customerName: name.trim(),
      customerPhone: phone,
      customerEmail: email.trim(),
      orderType,
      customerNotes: notes.trim(),
      address:
        orderType === "delivery" && selectedZone
          ? {
              cep: selectedZone.cep,
              street: street.trim(),
              number: number.trim(),
              complement: complement.trim(),
              neighborhood: selectedZone.name,
              city: selectedZone.city,
              state: selectedZone.state,
              reference: reference.trim(),
            }
          : null,
      items: items.map(({ productId, sizeId, optionIds, notes, quantity }) => ({
        productId,
        sizeId,
        optionIds,
        notes,
        quantity,
      })),
    };
    const fingerprint = JSON.stringify(order);
    if (retry.current?.fingerprint !== fingerprint)
      retry.current = { fingerprint, key: crypto.randomUUID() };
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...order, idempotencyKey: retry.current.key }),
      });
      const result: { error?: string; checkoutUrl?: string } =
        await response.json();
      if (!response.ok || !result.checkoutUrl) {
        setError(result.error ?? "Não foi possível iniciar o pagamento.");
        if (response.status === 409) retry.current = null;
        return;
      }
      const url = new URL(result.checkoutUrl);
      if (
        url.protocol !== "https:" ||
        url.hostname !== "sandbox.mercadopago.com"
      ) {
        setError("Endereço de pagamento inválido.");
        return;
      }
      window.location.assign(url.toString());
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="checkout-form" onSubmit={submit}>
      <h3>Pagamento online de teste</h3>
      <p>
        Pix ou cartão pelo Mercado Pago. O valor final será conferido no
        servidor.
      </p>
      <div className="checkout-form__methods">
        <span>
          Pagamento da retirada{" "}
          {availability.pickup ? "— disponível" : "— aguardando ativação"}
        </span>
        <span>
          Entrega{" "}
          {availability.delivery
            ? "— disponível"
            : "— aguardando ativação do pagamento"}
        </span>
      </div>
      <fieldset className="checkout-form__fulfillment">
        <legend>Como deseja receber?</legend>
        <label>
          <input
            type="radio"
            name="orderType"
            value="pickup"
            checked={orderType === "pickup"}
            onChange={() => setOrderType("pickup")}
          />
          Retirar no balcão (sem taxa)
        </label>
        <label>
          <input
            type="radio"
            name="orderType"
            value="delivery"
            checked={orderType === "delivery"}
            onChange={() => setOrderType("delivery")}
            disabled={!deliveryZones.length}
          />
          Receber em casa
        </label>
      </fieldset>
      {orderType === "delivery" ? (
        <div className="checkout-form__address">
          <label>
            Bairro
            <select
              value={neighborhood}
              onChange={(event) => setNeighborhood(event.target.value)}
              required
            >
              <option value="">Selecione o bairro</option>
              {deliveryZones.map((zone) => (
                <option key={zone.name} value={zone.name}>
                  {zone.name} — taxa {formatPrice(zone.feeCents)}
                </option>
              ))}
            </select>
          </label>
          <p>CEP atendido: 27475-000 · Rio Claro/RJ</p>
          <label>
            Rua
            <input
              value={street}
              onChange={(event) => setStreet(event.target.value)}
              minLength={2}
              maxLength={120}
              autoComplete="street-address"
              required
            />
          </label>
          <label>
            Número
            <input
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              maxLength={20}
              required
            />
          </label>
          <label>
            Complemento (opcional)
            <input
              value={complement}
              onChange={(event) => setComplement(event.target.value)}
              maxLength={120}
            />
          </label>
          <label>
            Referência (opcional)
            <input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              maxLength={120}
            />
          </label>
          <p>Pedido mínimo: {formatPrice(3000)} (sem a taxa de entrega).</p>
          {selectedZone ? (
            <strong>
              Total estimado:{" "}
              {formatPrice(subtotalCents + selectedZone.feeCents)}
            </strong>
          ) : null}
        </div>
      ) : null}
      <label>
        Nome completo
        <input
          name="name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={120}
          required
        />
      </label>
      <label>
        WhatsApp para contato
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="(24) 99999-9999"
          required
        />
      </label>
      <label>
        E-mail (opcional)
        <input
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        Observações do pedido (opcional)
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={1000}
          rows={2}
        />
      </label>
      {error ? (
        <p className="checkout-form__error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="button button--primary"
        disabled={
          !canCheckout ||
          !items.length ||
          busy ||
          (orderType === "delivery" && (!selectedZone || subtotalCents < 3000))
        }
      >
        {busy ? "Preparando pagamento…" : "Pagar com Pix ou cartão"}
      </button>
      {!canCheckout ? (
        <small>
          O checkout será liberado após configurar e validar o ambiente de
          teste.
        </small>
      ) : null}
    </form>
  );
}
