"use client";
import Image from "next/image";
import { useRef } from "react";
import { useCart } from "@/components/cart/cart-provider";
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
      left: direction * (card.getBoundingClientRect().width + 24),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div className="carousel">
      <div className="carousel__controls">
        <button
          className="carousel__arrow"
          aria-label="Produto anterior"
          onClick={() => move(-1)}
        >
          ←
        </button>
        <button
          className="carousel__arrow"
          aria-label="Próximo produto"
          onClick={() => move(1)}
        >
          →
        </button>
      </div>
      <div className="carousel__track" ref={track}>
        {products.map((product) => (
          <article className="pizza-card" key={product.id}>
            <div className="pizza-card__image">
              {product.image_url?.startsWith("/assets/") ? (
                <Image
                  src={product.image_url}
                  width={900}
                  height={675}
                  sizes="(max-width: 820px) 220px, 300px"
                  alt={`Pizza ${product.name}`}
                />
              ) : null}
            </div>
            <div className="pizza-card__content">
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <footer className="pizza-card__footer">
                <strong>
                  {getStartingPrice(product, sizes).hasSizes ? (
                    <small>A partir de </small>
                  ) : null}
                  {formatPrice(getStartingPrice(product, sizes).cents)}
                </strong>
                <button
                  className="pizza-card__add"
                  disabled={!product.available}
                  aria-label={`Personalizar ${product.name}`}
                  onClick={() => configure(product)}
                >
                  {product.available ? "+" : "×"}
                </button>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
