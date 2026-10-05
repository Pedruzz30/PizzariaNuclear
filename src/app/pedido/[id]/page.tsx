import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/catalog-schema";
import { reconcileMercadoPagoPayment } from "@/server/mercado-pago";
import { getOrderForSession, ORDER_SESSION_COOKIE } from "@/server/orders";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Acompanhar pedido | Pizzaria Nuclear",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_id?: string }>;
}) {
  const [{ id }, query, cookieStore] = await Promise.all([
    params,
    searchParams,
    cookies(),
  ]);
  if (!/^[a-f0-9-]{36}$/.test(id)) notFound();
  const token = cookieStore.get(ORDER_SESSION_COOKIE)?.value;
  let data = await getOrderForSession(id, token);
  if (!data) notFound();
  const paymentId = query.payment_id;
  if (
    paymentId &&
    /^\d{1,30}$/.test(paymentId) &&
    data.order.payment_status !== "approved"
  ) {
    try {
      await reconcileMercadoPagoPayment(
        paymentId,
        `return:${paymentId}:${id}`,
        id,
      );
      data = await getOrderForSession(id, token);
    } catch {
      // A URL de retorno não prova pagamento. O estado do banco permanece até a verificação.
    }
  }
  if (!data) notFound();
  const { order, items, options } = data;
  const paymentLabel: Record<string, string> = {
    pending: "Aguardando pagamento",
    processing: "Pagamento em análise",
    approved: "Pagamento confirmado",
    rejected: "Pagamento recusado",
    cancelled: "Pagamento cancelado",
    refunded: "Pagamento reembolsado",
    partially_refunded: "Pagamento parcialmente reembolsado",
    charged_back: "Pagamento contestado",
  };
  return (
    <main className="order-page">
      <Link href="/">← Voltar ao cardápio</Link>
      <span className="section__eyebrow">Acompanhe seu pedido</span>
      <h1>Pedido #{order.public_order_number}</h1>
      <p className="order-page__status" role="status">
        {paymentLabel[order.payment_status] ?? "Status em atualização"}
      </p>
      <p>
        {order.payment_status === "approved"
          ? "O pagamento foi verificado com o Mercado Pago. A unidade seguirá com a preparação."
          : "Esta página só mostra o estado confirmado pelo servidor. O retorno do pagamento pode levar alguns instantes."}
      </p>
      <dl>
        <div>
          <dt>Modalidade</dt>
          <dd>
            {order.order_type === "pickup" ? "Retirada no balcão" : "Entrega"}
          </dd>
        </div>
        <div>
          <dt>Estado do pedido</dt>
          <dd>
            {order.order_status === "confirmed"
              ? "Confirmado"
              : order.order_status === "awaiting_payment"
                ? "Aguardando pagamento"
                : order.order_status}
          </dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrice(order.subtotal_cents)}</dd>
        </div>
        {order.delivery_fee_cents ? (
          <div>
            <dt>Entrega</dt>
            <dd>{formatPrice(order.delivery_fee_cents)}</dd>
          </div>
        ) : null}
        <div>
          <dt>Total</dt>
          <dd>{formatPrice(order.total_cents)}</dd>
        </div>
      </dl>
      <h2>Itens</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.quantity} × {item.product_name}
            {item.size_name ? ` (${item.size_name})` : ""} —{" "}
            {formatPrice(item.total_price_cents)}
            {options.some((option) => option.order_item_id === item.id) ? (
              <small className="order-page__options">
                {options
                  .filter((option) => option.order_item_id === item.id)
                  .map((option) => option.option_name)
                  .join(", ")}
              </small>
            ) : null}
          </li>
        ))}
      </ul>
      <a href={`/pedido/${id}`} className="button button--primary">
        Atualizar situação
      </a>
      <p className="cart-note">
        O acesso a esta página depende deste navegador. Guarde o número do
        pedido para falar com a unidade.
      </p>
    </main>
  );
}
