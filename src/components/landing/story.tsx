import Image from "next/image";
import type { Catalog } from "@/lib/catalog-schema";
import { brazilianWhatsAppNumber } from "@/lib/contact";

const featuredSlugs = ["margherita", "4-queijos", "calabresa"];

export function Story({ catalog }: { catalog: Catalog }) {
  const featured = featuredSlugs
    .map((slug) => catalog.products.find((product) => product.slug === slug))
    .filter((product) => product !== undefined);
  const pizzaCategory = catalog.categories.find(
    (category) => category.slug === "pizzas",
  );
  const pizzaCount = catalog.products.filter(
    (product) => product.category_id === pizzaCategory?.id,
  ).length;
  const sizeCount = new Set(catalog.sizes.map((size) => size.name)).size;
  const borderCount = catalog.options.filter((option) =>
    catalog.optionGroups.some(
      (group) => group.id === option.option_group_id && group.kind === "crust",
    ),
  ).length;
  const extraCount = catalog.options.filter((option) =>
    catalog.optionGroups.some(
      (group) => group.id === option.option_group_id && group.kind === "extra",
    ),
  ).length;
  const whatsappNumber = brazilianWhatsAppNumber(
    catalog.storeContact?.whatsapp,
  );
  const dailyHours =
    catalog.storeHours.length === 7 &&
    catalog.storeHours.every(
      (hours) =>
        hours.opens_at === catalog.storeHours[0].opens_at &&
        hours.closes_at === catalog.storeHours[0].closes_at &&
        !hours.closes_next_day,
    )
      ? catalog.storeHours[0]
      : null;

  return (
    <>
      <section className="section flavors" id="sabores">
        <header className="section__head">
          <span className="section__eyebrow">02 — Sabores</span>
          <h2 className="section__title">
            Escolha seu <em>favorito</em>
          </h2>
          <p className="section__lead">
            Conheça alguns sabores do cardápio. Você pode pedir sua pizza
            inteira ou meio a meio.
          </p>
        </header>
        <div className="flavors__grid">
          {featured.map((product, index) => (
            <article className="flavor" key={product.id}>
              <span className="flavor__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flavor__media">
                <Image
                  src={product.image_url ?? "/assets/pizzas/hero-pizza.png"}
                  width={900}
                  height={675}
                  alt={
                    product.image_url
                      ? `Pizza ${product.name}`
                      : "Imagem ilustrativa de pizza"
                  }
                  loading="lazy"
                  sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
                />
              </div>
              <h3 className="flavor__name">{product.name}</h3>
              <p className="flavor__text">{product.description}</p>
              <ul className="flavor__tags">
                <li>Inteira</li>
                <li>Meio a meio</li>
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="section about" id="sobre">
        <div className="about__media">
          <div className="about__circle" />
          <Image
            className="about__image"
            src="/assets/pizzas/hero-pizza.png"
            width={1254}
            height={1254}
            alt="Imagem ilustrativa de pizza"
            loading="lazy"
            sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
          />
          <Image
            className="about__seal"
            src="/assets/logo/nuclear-seal.svg"
            width={220}
            height={220}
            alt=""
            loading="lazy"
            sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
          />
        </div>
        <div className="about__copy">
          <span className="section__eyebrow">03 — Seu pedido</span>
          <h2 className="section__title">
            Seu tamanho, <em>seu sabor</em>
          </h2>
          <p className="about__text">
            Escolha entre Pequena, Média, Grande e Maracanã. O meio a meio custa
            o mesmo que a pizza inteira no tamanho escolhido.
          </p>
          <p className="about__text">
            Bordas e adicionais são opcionais e têm seus valores mostrados antes
            de adicionar a pizza ao carrinho.
          </p>
          <dl className="about__stats">
            <div className="stat">
              <dt className="stat__label">Sabores de pizza</dt>
              <dd className="stat__value">{pizzaCount}</dd>
            </div>
            <div className="stat">
              <dt className="stat__label">Tamanhos</dt>
              <dd className="stat__value">{sizeCount}</dd>
            </div>
            <div className="stat">
              <dt className="stat__label">Bordas</dt>
              <dd className="stat__value">{borderCount}</dd>
            </div>
            <div className="stat">
              <dt className="stat__label">Adicionais</dt>
              <dd className="stat__value">{extraCount}</dd>
            </div>
          </dl>
          <a href="#cardapio" className="button button--primary">
            <span>Ver cardápio</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <section className="section stores" id="atendimento">
        <header className="section__head">
          <span className="section__eyebrow">04 — Atendimento</span>
          <h2 className="section__title">
            A Nuclear em <em>Lídice</em>
          </h2>
          <p className="section__lead">
            Confira o endereço e o horário da unidade. Pedidos e pagamentos
            online ainda estão em preparação.
          </p>
        </header>
        <div className="stores__grid">
          <article className="store">
            <header className="store__head">
              <h3 className="store__name">Nuclear Lídice</h3>
              <span className="store__status">Todos os dias</span>
            </header>
            <p className="store__address">
              {catalog.storeContact?.address || "Endereço em confirmação"}
            </p>
            <dl className="store__info">
              <div>
                <dt>Horário</dt>
                <dd>
                  {dailyHours
                    ? `Todos os dias, das ${dailyHours.opens_at.slice(0, 2)}h às ${dailyHours.closes_at.slice(0, 2)}h`
                    : "Em confirmação"}
                </dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{catalog.storeContact?.phone || "Em confirmação"}</dd>
              </div>
            </dl>
            {whatsappNumber ? (
              <div className="store__actions">
                <a
                  className="store__action store__action--primary"
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </div>
            ) : null}
          </article>
        </div>
      </section>
    </>
  );
}
