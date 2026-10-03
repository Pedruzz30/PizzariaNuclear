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
  MAX_QUANTITY,
  cartReducer,
  parseCart,
  resolveCart,
  type CartLine,
  type CartAction,
} from "@/lib/cart";
import { formatPrice, type Product } from "@/lib/catalog-schema";

const CartContext = createContext<{
  add: (product: Product) => void;
  open: () => void;
  count: number;
} | null>(null);
export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("CartProvider não encontrado");
  return cart;
}

export function CartProvider({
  products,
  children,
}: {
  products: Product[];
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
  const dialog = useRef<HTMLDialogElement>(null);
  const lines = resolveCart(items, products);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce(
    (sum, line) => sum + line.product.base_price_cents * line.quantity,
    0,
  );

  useEffect(() => {
    try {
      dispatch({
        type: "hydrate",
        items: parseCart(localStorage.getItem(CART_KEY)),
      });
    } catch {
      dispatch({ type: "hydrate", items: [] });
    }
  }, []);
  useEffect(() => {
    if (!state.ready) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ version: 2, items }));
    } catch {
      /* Armazenamento indisponível. */
    }
  }, [items, state.ready]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2600);
    return () => clearTimeout(timer);
  }, [message]);

  function add(product: Product) {
    if (!product.active || !product.available) return;
    dispatch({ type: "add", productId: product.id });
    setMessage(`${product.name} adicionada ao pedido`);
  }
  function close() {
    dialog.current?.close();
  }

  return (
    <CartContext
      value={{ add, count, open: () => dialog.current?.showModal() }}
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
              Seu carrinho está vazio. Que tal começar pela Diavola?
            </p>
          ) : null}
          {items.length !== lines.length ? (
            <p className="cart-notice" role="status">
              Itens indisponíveis foram excluídos do total.{" "}
              <button
                onClick={() =>
                  dispatch({
                    type: "hydrate",
                    items: lines.map(({ productId, quantity }) => ({
                      productId,
                      quantity,
                    })),
                  })
                }
              >
                Remover itens indisponíveis
              </button>
            </p>
          ) : null}
          <ul className="cart-list">
            {lines.map(({ product, quantity }) => (
              <li className="cart-item" key={product.id}>
                <span className="cart-item__name">{product.name}</span>
                <span className="cart-item__price">
                  {formatPrice(product.base_price_cents * quantity)}
                </span>
                <div className="cart-item__controls">
                  <button
                    className="cart-item__button"
                    aria-label={`Diminuir quantidade de ${product.name}`}
                    onClick={() =>
                      dispatch({
                        type: "quantity",
                        productId: product.id,
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
                        productId: product.id,
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
                  onClick={() =>
                    dispatch({ type: "remove", productId: product.id })
                  }
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
          <footer className="drawer__footer">
            <div className="cart-total">
              <span>Subtotal</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <p className="cart-note">
              Entrega e disponibilidade serão confirmadas pelo atendimento.
              Pagamento pelo site será habilitado em uma próxima etapa.
            </p>
            <button
              className="button button--primary cart-checkout"
              disabled={!lines.length}
              onClick={() => {
                const text =
                  "Olá! Gostaria de consultar este pedido na Nuclear:\n\n" +
                  lines
                    .map(
                      ({ product, quantity }) =>
                        `${quantity}x ${product.name} — ${formatPrice(product.base_price_cents * quantity)}`,
                    )
                    .join("\n") +
                  `\n\nSubtotal estimado: ${formatPrice(total)}`;
                window.open(
                  `https://wa.me/553132220101?text=${encodeURIComponent(text)}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              Consultar pelo WhatsApp
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
