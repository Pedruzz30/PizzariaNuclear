"use client";

import { CartOpenButton } from "@/components/cart/cart-provider";
import { Icon } from "@/components/icon";

export function CallToAction({ phone }: { phone: string | null }) {
  const phoneHref = phone ? phone.replace(/[^\d+]/g, "") : null;

  return (
    <section className="section cta theme-red" aria-labelledby="cta-title">
      <div className="container grid cta__grid">
        <div className="cta__copy reveal">
          <span className="eyebrow section__eyebrow">Sem enrolação</span>
          <h2 className="display cta__title" id="cta-title">
            <span>Tá com fome?</span>
            <span className="is-ink">Pede Nuclear.</span>
          </h2>
          <p className="cta__text">
            Monte sua pizza, escolha tamanho, segundo sabor, borda e adicionais.
            Confira tudo no carrinho antes de enviar o pedido.
          </p>
        </div>
        <div className="cta__actions reveal">
          <CartOpenButton className="button button--secondary cta__cart">
            <Icon name="cart" />
            <span>Montar pedido</span>
          </CartOpenButton>
          <a href="#cardapio" className="button button--outline">
            <span>Ver cardápio</span>
            <Icon name="arrow-right" className="icon--arrow" />
          </a>
          {phoneHref ? (
            <p className="cta__phone">
              Prefere ligar? <a href={`tel:${phoneHref}`}>{phone}</a>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
