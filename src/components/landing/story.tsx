import Image from "next/image";
import type { Catalog } from "@/lib/catalog-schema";
import { brazilianWhatsAppNumber } from "@/lib/contact";
import { Icon } from "@/components/icon";
import { CallToAction } from "@/components/landing/call-to-action";

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
      <section className="section flavors theme-dark" id="sabores">
        <div className="container">
          <header className="section__head reveal">
            <span className="eyebrow section__eyebrow">02 — Sabores</span>
            <h2 className="display section__title">
              Escolha seu <em>favorito</em>
            </h2>
            <p className="section__lead">
              Conheça alguns sabores do cardápio. Você pode pedir sua pizza
              inteira ou meio a meio.
            </p>
          </header>
          <div className="flavors__list">
            {featured.map((product, index) => (
              <article className="flavor reveal" key={product.id}>
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
                <div className="flavor__body">
                  <h3 className="display flavor__name">{product.name}</h3>
                  <p className="flavor__text">{product.description}</p>
                  <ul className="flavor__ingredients">
                    <li>Inteira</li>
                    <li>Meio a meio</li>
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section about" id="sobre">
        <div className="container grid about__grid">
          <div className="about__media reveal">
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
          <div className="about__copy reveal">
            <span className="eyebrow section__eyebrow">03 — Seu pedido</span>
            <h2 className="display about__title">
              Seu tamanho, <em>seu sabor</em>
            </h2>
            <p className="about__text">
              Escolha entre Pequena, Média, Grande e Maracanã. O meio a meio
              custa o mesmo que a pizza inteira no tamanho escolhido.
            </p>
            <p className="about__text">
              Bordas e adicionais são opcionais e têm seus valores mostrados
              antes de adicionar a pizza ao carrinho.
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
            <a
              href="#cardapio"
              className="button button--primary about__action"
            >
              <span>Ver cardápio</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>
      <section className="section stores section--sand" id="atendimento">
        <div className="container">
          <header className="section__head reveal">
            <span className="eyebrow section__eyebrow">04 — Atendimento</span>
            <h2 className="display section__title">
              A Nuclear em <em>Lídice</em>
            </h2>
            <p className="section__lead">
              Confira o endereço e o horário da unidade. Pedidos e pagamentos
              online ainda estão em preparação.
            </p>
          </header>
          <div className="stores__grid">
            <article className="store reveal">
              <span className="label store__index">01</span>
              <header className="store__head">
                <h3 className="store__name">Nuclear Lídice</h3>
                <span className="store__status">Todos os dias</span>
              </header>
              <dl className="store__rows">
                <div className="store__row">
                  <Icon name="location" />
                  <div>
                    <dt>Endereço</dt>
                    <dd>
                      {catalog.storeContact?.address ||
                        "Endereço em confirmação"}
                    </dd>
                  </div>
                </div>
                <div className="store__row">
                  <Icon name="clock" />
                  <div>
                    <dt>Horário</dt>
                    <dd>
                      {dailyHours
                        ? `Todos os dias, das ${dailyHours.opens_at.slice(0, 2)}h às ${dailyHours.closes_at.slice(0, 2)}h`
                        : "Em confirmação"}
                    </dd>
                  </div>
                </div>
                <div className="store__row">
                  <Icon name="phone" />
                  <div>
                    <dt>Telefone</dt>
                    <dd>{catalog.storeContact?.phone || "Em confirmação"}</dd>
                  </div>
                </div>
              </dl>
              {whatsappNumber ? (
                <div className="store__actions">
                  <a
                    className="button button--primary button--sm"
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
        </div>
      </section>
      <CallToAction phone={catalog.storeContact?.phone ?? null} />
    </>
  );
}
