"use client";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice, type Catalog } from "@/lib/catalog-schema";
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function Menu({ categories, products }: Catalog) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const { add } = useCart();
  const visible = products.filter(
    (product) =>
      (category === "all" || product.category_id === category) &&
      normalize(
        `${product.name} ${product.description} ${product.tag}`,
      ).includes(normalize(search.trim())),
  );
  return (
    <section className="section menu" id="cardapio">
      <header className="section__head">
        <span className="section__eyebrow">01 — Cardápio</span>
        <h2 className="section__title">
          Escolha sua <em>explosão</em>
        </h2>
        <p className="section__lead">
          Massa de fermentação natural por 48 horas, assada em forno a lenha.
          Sabores do nosso cardápio.
        </p>
      </header>
      <div className="menu__toolbar">
        <div
          className="menu__filters"
          role="group"
          aria-label="Filtrar cardápio por categoria"
        >
          {[{ id: "all", name: "Todas" }, ...categories].map((item) => (
            <button
              key={item.id}
              className={`menu__filter ${category === item.id ? "menu__filter--active" : ""}`}
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="menu__search">
          <label htmlFor="menu-search" className="visually-hidden">
            Buscar sabor
          </label>
          <span className="menu__search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="menu-search"
            className="menu__search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar sabor ou ingrediente"
          />
        </div>
      </div>
      <div className="menu__grid">
        {visible.map((product) => (
          <article key={product.id} className="menu-item">
            <header className="menu-item__head">
              <h3 className="menu-item__name">{product.name}</h3>
              <span className="menu-item__dots" aria-hidden="true" />
              <span className="menu-item__price">
                {formatPrice(product.base_price_cents)}
              </span>
            </header>
            <p className="menu-item__description">{product.description}</p>
            <footer className="menu-item__footer">
              <span className="menu-item__tag">{product.tag}</span>
              <button
                className="menu-item__add"
                disabled={!product.available}
                aria-label={`Adicionar ${product.name}`}
                onClick={() => add(product)}
              >
                {product.available ? "Adicionar" : "Indisponível"}
              </button>
            </footer>
          </article>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="menu__empty" role="status">
          Nenhum sabor encontrado.
        </p>
      ) : null}
    </section>
  );
}
