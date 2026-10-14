"use client";
import Image from "next/image";
import { useRef } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { Icon } from "@/components/icon";
import {
  formatPrice,
  getStartingPrice,
  type Product,
  type ProductSize,
} from "@/lib/catalog-schema";

export function FeaturedCarousel({
  products,
  sizes,
}: {
  products: Product[];
  sizes: ProductSize[];
}) {
  const track = useRef<HTMLDivElement>(null);
  const { configure } = useCart();
  function move(direction: number) {
    const node = track.current;
    const card = node?.firstElementChild;
    if (!node || !card) return;
    node.scrollBy({
      left: direction * (card.getBoundingClientRect().width + 16),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div className="carousel">
      <div className="carousel__head">
        <span className="label carousel__label">Direto do forno</span>
        <div className="carousel__controls">
          <button
            className="button button--icon button--sm carousel__arrow"
            aria-label="Produto anterior"
            onClick={() => move(-1)}
          >
            <Icon name="arrow-left" className="icon--sm" />
          </button>
          <button
            className="button button--icon button--sm carousel__arrow"
            aria-label="Próximo produto"
            onClick={() => move(1)}
          >
            <Icon name="arrow-right" className="icon--sm" />
          </button>
        </div>
      </div>
      <div className="carousel__track" ref={track}>
        {products.map((product) => {
          const price = getStartingPrice(product, sizes);
          return (
            <article className="product product--featured" key={product.id}>
              <div className="product__media">
                {product.image_url?.startsWith("/assets/") ? (
                  <Image
                    src={product.image_url}
                    width={900}
                    height={675}
                    sizes="(max-width: 767px) 208px, 224px"
                    alt={`Pizza ${product.name}`}
                  />
                ) : null}
              </div>
              <div className="product__body">
                <h2 className="product__name">{product.name}</h2>
                <p className="product__ingredients">{product.description}</p>
                <footer className="product__footer">
                  <strong className="product__price">
                    {price.hasSizes ? <small>A partir de </small> : null}
                    {formatPrice(price.cents)}
                  </strong>
                  <button
                    className="product__add product__add--circle"
                    disabled={!product.available}
                    aria-label={`Personalizar ${product.name}`}
                    onClick={() => configure(product)}
                  >
                    <Icon name="plus" />
                  </button>
                </footer>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
