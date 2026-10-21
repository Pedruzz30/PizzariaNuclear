import Image from "next/image";
import type { Product, ProductSize } from "@/lib/catalog-schema";
import { CartOpenButton } from "@/components/cart/cart-provider";
import { FeaturedCarousel } from "@/components/menu/featured-carousel";
import { Icon } from "@/components/icon";
import type { StoreContact } from "@/lib/catalog-schema";
import { brazilianWhatsAppNumber } from "@/lib/contact";

export function Hero({
  featured,
  sizes,
  contact,
}: {
  featured: Product[];
  sizes: ProductSize[];
  contact: StoreContact | null;
}) {
  const whatsappNumber = brazilianWhatsAppNumber(contact?.whatsapp);
  return (
    <section className="hero" id="inicio">
      <div className="hero__content container grid">
        <div className="hero__copy">
          <div className="hero__copy-main">
            <span className="eyebrow hero__eyebrow">Mais que pizza</span>
            <h1 className="display hero__title" aria-label="Sabor que explode">
              <span className="hero-word">SABOR</span>
              <span className="hero-word hero-word--accent">QUE</span>
              <span className="hero-word">EXPLODE</span>
            </h1>
            <p className="hero__description">
              <strong>Pizzaria Nuclear</strong> tem 21 sabores de pizza em
              quatro tamanhos. Escolha sua favorita inteira ou meio a meio pelo
              mesmo preço.
            </p>
            <div className="hero__buttons">
              <a href="#cardapio" className="button button--primary">
                <span>Ver cardápio</span>
                <Icon name="arrow-right" className="icon--arrow" />
              </a>
              <CartOpenButton className="button button--icon" />
            </div>
          </div>
          <div className="hero__foot">
            <a
              href="#cardapio"
              className="button button--icon button--ghost scroll-indicator"
              aria-label="Ir para o cardápio"
            >
              <Icon name="arrow-down" />
            </a>
            <span className="hero__signature">Fatias que fazem sentido.</span>
          </div>
        </div>
        <figure
          className="hero__stage"
          aria-label="Pizza principal da Pizzaria Nuclear"
        >
          <div className="hero__circle" />
          <Image
            className="hero__pizza"
            src="/assets/pizzas/PizzaHero.png"
            width={1254}
            height={1254}
            alt="Pizza artesanal da Pizzaria Nuclear"
            priority
            sizes="(max-width: 767px) 96vw, (max-width: 1199px) 64vw, 56vw"
          />
          <div className="hero__seal">
            <Image
              className="hero__seal-image"
              src="/assets/logo/nuclear-seal.svg"
              width={220}
              height={220}
              alt="Massa artesanal, sabor real"
              priority
            />
          </div>
        </figure>
        <FeaturedCarousel products={featured} sizes={sizes} />
      </div>
      {whatsappNumber ? (
        <aside className="social" aria-label="Atendimento">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            className="social__link"
            aria-label="WhatsApp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" className="icon--sm" />
          </a>
        </aside>
      ) : null}
    </section>
  );
}
