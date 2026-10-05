"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CART_KEY,
  LEGACY_CART_KEY,
  MAX_QUANTITY,
  cartReducer,
  parseCart,
  resolveCart,
  type CartLine,
  type CartAction,
  type CartSelection,
} from "@/lib/cart";
import { formatPrice, type Catalog, type Product } from "@/lib/catalog-schema";
import { brazilianWhatsAppNumber } from "@/lib/contact";
import { ProductConfigurator } from "./product-configurator";
import { CheckoutForm } from "./checkout-form";
import type { CheckoutAvailability } from "@/server/checkout-availability";

const CartContext = createContext<{
  configure: (product: Product) => void;
  open: () => void;
  count: number;
} | null>(null);
export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("CartProvider não encontrado");
  return cart;
}

export function CartProvider({
  catalog,
  checkoutAvailability,
  children,
}: {
  catalog: Catalog;
  checkoutAvailability: CheckoutAvailability;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    (state: { items: CartLine[]; ready: boolean }, action: CartAction) => ({
      items: cartReducer(state.items, action),
      ready: state.ready || action.type === "hydrate",
    }),
    { items: [], ready: false },
  );
  const items = state.items;
  const [message, setMessage] = useState("");
  const [configuring, setConfiguring] = useState<Product | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const lines = resolveCart(items, catalog);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const whatsappNumber = brazilianWhatsAppNumber(
    catalog.storeContact?.whatsapp,
  );

  useEffect(() => {
    try {
      dispatch({
        type: "hydrate",
        items: parseCart(
          localStorage.getItem(CART_KEY) ??
            localStorage.getItem(LEGACY_CART_KEY),
        ),
      });
    } catch {
      dispatch({ type: "hydrate", items: [] });
    }
  }, []);
  useEffect(() => {
    if (!state.ready) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ version: 3, items }));
    } catch {
      /* Armazenamento indisponível. */
    }
  }, [items, state.ready]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2600);
    return () => clearTimeout(timer);
  }, [message]);

  function add(selection: CartSelection) {
    if (!resolveCart([{ ...selection, quantity: 1 }], catalog).length) return;
    dispatch({ type: "add", line: selection });
    const product = catalog.products.find(
      (item) => item.id === selection.productId,
    );
    if (product) setMessage(`${product.name} adicionado ao pedido`);
  }
  function close() {
    dialog.current?.close();
  }

  return (
    <CartContext
      value={{
        configure: (product) => setConfiguring(product),
        count,
        open: () => dialog.current?.showModal(),
      }}
    >
      {children}
      <dialog
        ref={dialog}
        className="cart-dialog drawer is-open"
        aria-labelledby="cart-title"
      >
        <div className="drawer__panel">
          <header className="drawer__head">
            <h2 id="cart-title" className="drawer__title">
              Seu pedido
            </h2>
            <button
              type="button"
              className="drawer__close"
              onClick={close}
              aria-label="Fechar carrinho"
              autoFocus
            >
              ✕
            </button>
          </header>
          {lines.length === 0 ? (
            <p className="cart-empty">
              Seu carrinho está vazio. Escolha uma pizza, kalzone ou bebida no
              cardápio.
            </p>
          ) : null}
          {items.length !== lines.length ? (
            <p className="cart-notice" role="status">
              Itens indisponíveis foram excluídos do total.{" "}
              <button
                onClick={() =>
                  dispatch({
                    type: "hydrate",
                    items: lines.map(
                      ({ productId, sizeId, optionIds, notes, quantity }) => ({
                        productId,
                        sizeId,
                        optionIds,
                        notes,
                        quantity,
                      }),
                    ),
                  })
                }
              >
                Remover itens indisponíveis
              </button>
            </p>
          ) : null}
          <ul className="cart-list">
            {lines.map(
              ({
                product,
                size,
                options,
                flavorOption,
                notes,
                quantity,
                key,
                lineTotalCents,
                unitPriceCents,
              }) => (
                <li className="cart-item" key={key}>
                  <div className="cart-item__summary">
                    <span className="cart-item__name">{product.name}</span>
                    {size ? <span>{size.name}</span> : null}
                    {flavorOption ? (
                      <span>Meio a meio com {flavorOption.name}</span>
                    ) : null}
                    {options.some(
                      (option) => option.id !== flavorOption?.id,
                    ) ? (
                      <span>
                        {options
                          .filter((option) => option.id !== flavorOption?.id)
                          .map((option) => option.name)
                          .join(", ")}
                      </span>
                    ) : null}
                    {notes ? <span>Obs.: {notes}</span> : null}
                    <small>{formatPrice(unitPriceCents)} por unidade</small>
                  </div>
                  <span className="cart-item__price">
                    {formatPrice(lineTotalCents)}
                  </span>
                  <div className="cart-item__controls">
                    <button
                      className="cart-item__button"
                      aria-label={`Diminuir quantidade de ${product.name}`}
                      onClick={() =>
                        dispatch({
                          type: "quantity",
                          key,
                          quantity: quantity - 1,
                        })
                      }
                    >
                      −
                    </button>
                    <span className="cart-item__quantity">{quantity}</span>
                    <button
                      className="cart-item__button"
                      disabled={quantity >= MAX_QUANTITY}
                      aria-label={`Aumentar quantidade de ${product.name}`}
                      onClick={() =>
                        dispatch({
                          type: "quantity",
                          key,
                          quantity: quantity + 1,
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-item__remove"
                    aria-label={`Remover ${product.name} do carrinho`}
                    onClick={() => dispatch({ type: "remove", key })}
                  >
                    Remover
                  </button>
                </li>
              ),
            )}
          </ul>
          <footer className="drawer__footer">
            <div className="cart-total">
              <span>Subtotal</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <p className="cart-note">
              Os valores exibidos no carrinho são estimativas. O checkout de
              teste confere tudo novamente no banco antes de iniciar o
              pagamento.
            </p>
            <CheckoutForm
              items={lines.map(
                ({ productId, sizeId, optionIds, notes, quantity }) => ({
                  productId,
                  sizeId,
                  optionIds,
                  notes,
                  quantity,
                }),
              )}
              availability={checkoutAvailability}
            />
            <button
              className="button button--primary cart-checkout"
              disabled={!lines.length || !whatsappNumber}
              onClick={() => {
                if (!whatsappNumber) return;
                const text =
                  "Olá! Gostaria de consultar este pedido na Nuclear:\n\n" +
                  lines
                    .map(
                      ({
                        product,
                        size,
                        options,
                        flavorOption,
                        notes,
                        quantity,
                        lineTotalCents,
                      }) =>
                        `${quantity}x ${product.name}${flavorOption ? ` / ${flavorOption.name} (meio a meio)` : ""}${size ? ` (${size.name})` : ""}${
                          options.some(
                            (option) => option.id !== flavorOption?.id,
                          )
                            ? ` + ${options
                                .filter(
                                  (option) => option.id !== flavorOption?.id,
                                )
                                .map((option) => option.name)
                                .join(", ")}`
                            : ""
                        }${notes ? ` | Obs.: ${notes}` : ""} — ${formatPrice(lineTotalCents)}`,
                    )
                    .join("\n") +
                  `\n\nSubtotal estimado: ${formatPrice(total)}`;
                window.open(
                  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              {whatsappNumber
                ? "Consultar pelo WhatsApp"
                : "WhatsApp em configuração"}
            </button>
            {items.length ? (
              <button
                className="cart-item__remove"
                onClick={() => dispatch({ type: "clear" })}
              >
                Limpar carrinho
              </button>
            ) : null}
          </footer>
        </div>
      </dialog>
      {configuring ? (
        <ProductConfigurator
          key={configuring.id}
          catalog={catalog}
          product={configuring}
          onAdd={add}
          onClose={() => setConfiguring(null)}
        />
      ) : null}
      <div
        className={`toast ${message ? "is-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message}
      </div>
    </CartContext>
  );
}

export function CartOpenButton({
  className = "header__cart",
}: {
  className?: string;
}) {
  const cart = useCart();
  return (
    <button
      type="button"
      className={className}
      onClick={cart.open}
      aria-label={`Abrir carrinho, ${cart.count} itens`}
    >
      <span aria-hidden="true">🛒</span>
      <span className="header__cart-count" aria-hidden="true">
        {cart.count}
      </span>
    </button>
  );
}
