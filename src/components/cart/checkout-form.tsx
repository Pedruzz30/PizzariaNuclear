"use client";

import { useRef, useState, type FormEvent } from "react";
import type { CartLine } from "@/lib/cart";
import type { CheckoutAvailability } from "@/server/checkout-availability";

export function CheckoutForm({
  items,
  availability,
}: {
  items: CartLine[];
  availability: CheckoutAvailability;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const retry = useRef<{ fingerprint: string; key: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!availability.pickup || !items.length || busy) return;
    setBusy(true);
    setError("");
    const order = {
      customerName: name.trim(),
      customerPhone: phone,
      customerEmail: email.trim(),
      orderType: "pickup" as const,
      customerNotes: notes.trim(),
      address: null,
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
          Entrega {availability.delivery ? "" : "— aguardando área e taxa"}
        </span>
      </div>
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
        disabled={!availability.pickup || !items.length || busy}
      >
        {busy ? "Preparando pagamento…" : "Pagar com Pix ou cartão"}
      </button>
      {!availability.pickup ? (
        <small>
          O checkout será liberado após configurar e validar o ambiente de
          teste.
        </small>
      ) : null}
    </form>
  );
}
