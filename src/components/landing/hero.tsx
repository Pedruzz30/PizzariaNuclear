import Image from "next/image";
import type { Product, ProductSize } from "@/lib/catalog-schema";
import { CartOpenButton } from "@/components/cart/cart-provider";
import { FeaturedCarousel } from "@/components/menu/featured-carousel";
export function Hero({
  featured,
  sizes,
}: {
  featured: Product[];
  sizes: ProductSize[];
}) {
  return (
    <section className="hero" id="inicio">
      {" "}
      <div className="hero__content">
        {" "}
        <div className="hero__copy">
          {" "}
          <span className="hero__eyebrow"> MAIS QUE PIZZA </span>{" "}
          <h1 className="hero__title" aria-label="Sabor que explode">
            {" "}
            <span className="hero-word"> SABOR </span>{" "}
            <span className="hero-word hero-word--accent"> QUE </span>{" "}
            <span className="hero-word"> EXPLODE </span>{" "}
          </h1>{" "}
          <p className="hero__description">
            {" "}
            <strong>Pizzaria Nuclear</strong> tem 21 sabores de pizza em quatro
            tamanhos. Escolha sua favorita inteira ou meio a meio pelo mesmo
            preço.{" "}
          </p>{" "}
          <div className="hero__buttons">
            {" "}
            <a href="#cardapio" className="button button--primary">
              {" "}
              <span> Ver cardápio </span>{" "}
              <span aria-hidden="true"> → </span>{" "}
            </a>{" "}
            <CartOpenButton className="button button--cart" />{" "}
          </div>{" "}
        </div>{" "}
        <div className="hero__seal">
          {" "}
          <Image
            className="hero__seal-image"
            src="/assets/logo/nuclear-seal.svg"
            width={220}
            height={220}
            alt="Massa artesanal, sabor real"
            loading="eager"
            sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
          />{" "}
        </div>{" "}
        <figure
          className="hero__visual"
          aria-label="Pizza principal da Pizzaria Nuclear"
        >
          {" "}
          <div className="hero__circle"></div>{" "}
          <Image
            className="hero__pizza"
            src="/assets/pizzas/PizzaHero.png"
            width={1254}
            height={1254}
            alt="Pizza artesanal da Pizzaria Nuclear"
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
          />{" "}
        </figure>{" "}
        <FeaturedCarousel products={featured} sizes={sizes} />{" "}
        <a
          href="#cardapio"
          className="scroll-indicator"
          aria-label="Ir para o cardápio"
        >
          {" "}
          ↓{" "}
        </a>{" "}
        <span className="hero__signature">
          {" "}
          FATIAS QUE FAZEM SENTIDO.{" "}
        </span>{" "}
      </div>{" "}
    </section>
  );
}
