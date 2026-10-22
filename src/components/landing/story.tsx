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

  const storeAddress = catalog.storeContact?.address?.trim() ?? "";
  const directionsUrl = storeAddress
    ? "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(storeAddress)
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
              Saiba onde nos encontrar, confira o horário e entre em contato
              diretamente com a unidade.
            </p>
          </header>
          <div className="stores__layout">
            <article className="store store--featured reveal">
              <header className="store__head">
                <div>
                  <span className="store__eyebrow">Nossa unidade</span>
                  <h3 className="store__name">Nuclear Lídice</h3>
                </div>
                <span className="store__status">
                  <span className="store__status-dot" aria-hidden="true" />
                  {dailyHours ? "Todos os dias" : "Horário sob consulta"}
                </span>
              </header>
              <dl className="store__rows">
                <div className="store__row store__row--address">
                  <span className="store__icon">
                    <Icon name="location" />
                  </span>
                  <div>
                    <dt>Onde estamos</dt>
                    <dd>
                      {storeAddress || "Endereço em confirmação"}
                    </dd>
                  </div>
                  {directionsUrl ? (
                    <a
                      className="store__directions"
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver no mapa
                      <Icon name="arrow-right" />
                    </a>
                  ) : null}
                </div>
                <div className="store__row">
                  <span className="store__icon">
                    <Icon name="clock" />
                  </span>
                  <div>
                    <dt>Funcionamento</dt>
                    <dd>
                      {dailyHours
                        ? "Todos os dias, " +
                          dailyHours.opens_at.slice(0, 2) +
                          "h às " +
                          dailyHours.closes_at.slice(0, 2) +
                          "h"
                        : "Consulte o horário com a equipe"}
                    </dd>
                  </div>
                </div>
                <div className="store__row">
                  <span className="store__icon">
                    <Icon name="phone" />
                  </span>
                  <div>
                    <dt>Telefone</dt>
                    <dd>
                      {catalog.storeContact?.phone ? (
                        <a
                          href={
                            "tel:" +
                            catalog.storeContact.phone.replace(/[^\d+]/g, "")
                          }
                        >
                          {catalog.storeContact.phone}
                        </a>
                      ) : (
                        "Em confirmação"
                      )}
                    </dd>
                  </div>
                </div>
              </dl>
            </article>
            <aside className="stores__contact reveal" aria-label="Contato da unidade">
              <div className="stores__contact-top">
                <span className="stores__contact-label">Fale com a Nuclear</span>
                <Icon name="spark" />
              </div>
              <div className="stores__contact-content">
                <h3 className="display stores__contact-title">
                  Precisou? <em>Chama a gente.</em>
                </h3>
                <p className="stores__contact-copy">
                  Tem alguma dúvida sobre nossos sabores ou atendimento?
                  Estamos a uma mensagem de distância.
                </p>
              </div>
              {whatsappNumber ? (
                <a
                  className="button button--primary stores__contact-action"
                  href={"https://wa.me/" + whatsappNumber}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="whatsapp" />
                  Conversar no WhatsApp
                  <Icon name="arrow-right" />
                </a>
              ) : (
                <p className="stores__contact-unavailable">
                  WhatsApp em confirmação
                </p>
              )}
              <p className="stores__contact-note">
                Pedidos e pagamentos pelo site ainda estão em preparação.
              </p>
            </aside>
          </div>
        </div>
      </section>
      <CallToAction phone={catalog.storeContact?.phone ?? null} />
    </>
  );
}
