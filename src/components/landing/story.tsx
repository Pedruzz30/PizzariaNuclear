import Image from "next/image";
export function Story() {
  return (
    <>
      <section className="section flavors" id="sabores">
        {" "}
        <header className="section__head">
          {" "}
          <span className="section__eyebrow"> 02 — Sabores </span>{" "}
          <h2 className="section__title">
            {" "}
            Os três que <em>marcam</em>{" "}
          </h2>{" "}
          <p className="section__lead">
            {" "}
            Todo mês a casa elege os sabores que mais saíram do forno. Estes são
            os campeões da temporada.{" "}
          </p>{" "}
        </header>{" "}
        <div className="flavors__grid">
          {" "}
          <article className="flavor">
            {" "}
            <span className="flavor__index"> 01 </span>{" "}
            <div className="flavor__media">
              {" "}
              <Image
                src="/assets/pizzas/diavola.png"
                width={900}
                height={675}
                alt="Pizza Diavola"
                loading="lazy"
                sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
              />{" "}
            </div>{" "}
            <h3 className="flavor__name"> Diavola </h3>{" "}
            <p className="flavor__text">
              {" "}
              Pepperoni curado na casa, mel picante e pimenta calabresa. A fatia
              que dá nome à pizzaria.{" "}
            </p>{" "}
            <ul className="flavor__tags">
              {" "}
              <li>Pepperoni</li> <li>Mel picante</li> <li>Calabresa</li>{" "}
            </ul>{" "}
            <div className="flavor__meter">
              {" "}
              <span className="flavor__meter-label"> Intensidade </span>{" "}
              <span
                className="flavor__meter-bar"
                role="img"
                aria-label="Intensidade 5 de 5"
              >
                {" "}
                <span
                  className="flavor__meter-fill"
                  style={{ width: "100%" }}
                ></span>{" "}
              </span>{" "}
            </div>{" "}
          </article>{" "}
          <article className="flavor">
            {" "}
            <span className="flavor__index"> 02 </span>{" "}
            <div className="flavor__media">
              {" "}
              <Image
                src="/assets/pizzas/quatro-queijos.png"
                width={900}
                height={675}
                alt="Pizza Quatro Queijos"
                loading="lazy"
                sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
              />{" "}
            </div>{" "}
            <h3 className="flavor__name"> Quatro Queijos </h3>{" "}
            <p className="flavor__text">
              {" "}
              Quatro queijos maturados em proporções calculadas para derreter
              junto e não brigar no paladar.{" "}
            </p>{" "}
            <ul className="flavor__tags">
              {" "}
              <li>Gorgonzola</li> <li>Parmesão</li> <li>Provolone</li>{" "}
            </ul>{" "}
            <div className="flavor__meter">
              {" "}
              <span className="flavor__meter-label"> Intensidade </span>{" "}
              <span
                className="flavor__meter-bar"
                role="img"
                aria-label="Intensidade 4 de 5"
              >
                {" "}
                <span
                  className="flavor__meter-fill"
                  style={{ width: "80%" }}
                ></span>{" "}
              </span>{" "}
            </div>{" "}
          </article>{" "}
          <article className="flavor">
            {" "}
            <span className="flavor__index"> 03 </span>{" "}
            <div className="flavor__media">
              {" "}
              <Image
                src="/assets/pizzas/prosciutto.png"
                width={900}
                height={675}
                alt="Pizza Prosciutto"
                loading="lazy"
                sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
              />{" "}
            </div>{" "}
            <h3 className="flavor__name"> Prosciutto </h3>{" "}
            <p className="flavor__text">
              {" "}
              Presunto cru maturado por 18 meses, colocado depois do forno para
              preservar o sabor.{" "}
            </p>{" "}
            <ul className="flavor__tags">
              {" "}
              <li>Presunto cru</li> <li>Rúcula</li> <li>Parmesão</li>{" "}
            </ul>{" "}
            <div className="flavor__meter">
              {" "}
              <span className="flavor__meter-label"> Intensidade </span>{" "}
              <span
                className="flavor__meter-bar"
                role="img"
                aria-label="Intensidade 3 de 5"
              >
                {" "}
                <span
                  className="flavor__meter-fill"
                  style={{ width: "60%" }}
                ></span>{" "}
              </span>{" "}
            </div>{" "}
          </article>{" "}
        </div>{" "}
      </section>
      <section className="section about" id="sobre">
        {" "}
        <div className="about__media">
          {" "}
          <div className="about__circle"></div>{" "}
          <Image
            className="about__image"
            src="/assets/pizzas/hero-pizza.png"
            width={1254}
            height={1254}
            alt="Pizza saindo do forno a lenha"
            loading="lazy"
            sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
          />{" "}
          <Image
            className="about__seal"
            src="/assets/logo/nuclear-seal.svg"
            width={220}
            height={220}
            alt=""
            loading="lazy"
            sizes="(max-width: 600px) 90vw, (max-width: 1100px) 50vw, 600px"
          />{" "}
        </div>{" "}
        <div className="about__copy">
          {" "}
          <span className="section__eyebrow"> 03 — Sobre </span>{" "}
          <h2 className="section__title">
            {" "}
            Massa lenta, <em>sabor rápido</em>{" "}
          </h2>{" "}
          <p className="about__text">
            {" "}
            A Nuclear nasceu em 2016 numa garagem no centro, com um forno a
            lenha emprestado e uma ideia teimosa: pizza não precisa ser
            previsível.{" "}
          </p>{" "}
          <p className="about__text">
            {" "}
            Hoje são três unidades, a mesma massa de fermentação natural de 48
            horas e ingredientes comprados direto de pequenos produtores da
            região. Nada de atalho, nada de sabor morno.{" "}
          </p>{" "}
          <dl className="about__stats">
            {" "}
            <div className="stat">
              {" "}
              <dt className="stat__label">Anos de forno</dt>{" "}
              <dd className="stat__value">09</dd>{" "}
            </div>{" "}
            <div className="stat">
              {" "}
              <dt className="stat__label">Pizzas assadas</dt>{" "}
              <dd className="stat__value">480k</dd>{" "}
            </div>{" "}
            <div className="stat">
              {" "}
              <dt className="stat__label">Sabores na casa</dt>{" "}
              <dd className="stat__value">14</dd>{" "}
            </div>{" "}
            <div className="stat">
              {" "}
              <dt className="stat__label">Unidades</dt>{" "}
              <dd className="stat__value">03</dd>{" "}
            </div>{" "}
          </dl>{" "}
          <a href="#unidades" className="button button--primary">
            {" "}
            <span> Conhecer as unidades </span>{" "}
            <span aria-hidden="true"> → </span>{" "}
          </a>{" "}
        </div>{" "}
      </section>
      <section className="section stores" id="unidades">
        {" "}
        <header className="section__head">
          {" "}
          <span className="section__eyebrow"> 04 — Unidades </span>{" "}
          <h2 className="section__title">
            {" "}
            Onde a gente <em>acende o forno</em>{" "}
          </h2>{" "}
          <p className="section__lead">
            {" "}
            Entrega em até 40 minutos para bairros vizinhos. Retirada no balcão
            sai sempre 10% mais barata.{" "}
          </p>{" "}
        </header>{" "}
        <div className="stores__grid">
          {" "}
          <article className="store">
            {" "}
            <header className="store__head">
              {" "}
              <h3 className="store__name"> Nuclear Centro </h3>{" "}
              <span className="store__status"> Matriz </span>{" "}
            </header>{" "}
            <p className="store__address">
              {" "}
              Rua das Oliveiras, 214
              <br /> Centro — Belo Horizonte / MG{" "}
            </p>{" "}
            <dl className="store__info">
              {" "}
              <div>
                {" "}
                <dt>Horário</dt> <dd>Ter a dom, 18h às 23h30</dd>{" "}
              </div>{" "}
              <div>
                {" "}
                <dt>Telefone</dt> <dd>(31) 3222-0101</dd>{" "}
              </div>{" "}
            </dl>{" "}
            <div className="store__actions">
              {" "}
              <a
                href="tel:+553132220101"
                className="store__action store__action--primary"
              >
                {" "}
                Ligar{" "}
              </a>{" "}
              <a
                href="https://maps.google.com/?q=Rua+das+Oliveiras+214+Belo+Horizonte"
                className="store__action"
                target="_blank"
                rel="noopener"
              >
                {" "}
                Ver no mapa{" "}
              </a>{" "}
            </div>{" "}
          </article>{" "}
          <article className="store">
            {" "}
            <header className="store__head">
              {" "}
              <h3 className="store__name"> Nuclear Savassi </h3>{" "}
              <span className="store__status">
                {" "}
                Delivery 24h sex e sáb{" "}
              </span>{" "}
            </header>{" "}
            <p className="store__address">
              {" "}
              Av. Getúlio Vargas, 1.480
              <br /> Savassi — Belo Horizonte / MG{" "}
            </p>{" "}
            <dl className="store__info">
              {" "}
              <div>
                {" "}
                <dt>Horário</dt> <dd>Seg a dom, 18h às 01h</dd>{" "}
              </div>{" "}
              <div>
                {" "}
                <dt>Telefone</dt> <dd>(31) 3222-0202</dd>{" "}
              </div>{" "}
            </dl>{" "}
            <div className="store__actions">
              {" "}
              <a
                href="tel:+553132220202"
                className="store__action store__action--primary"
              >
                {" "}
                Ligar{" "}
              </a>{" "}
              <a
                href="https://maps.google.com/?q=Avenida+Getulio+Vargas+1480+Belo+Horizonte"
                className="store__action"
                target="_blank"
                rel="noopener"
              >
                {" "}
                Ver no mapa{" "}
              </a>{" "}
            </div>{" "}
          </article>{" "}
          <article className="store">
            {" "}
            <header className="store__head">
              {" "}
              <h3 className="store__name"> Nuclear Pampulha </h3>{" "}
              <span className="store__status"> Espaço kids </span>{" "}
            </header>{" "}
            <p className="store__address">
              {" "}
              Rua Fernão Dias, 77
              <br /> Pampulha — Belo Horizonte / MG{" "}
            </p>{" "}
            <dl className="store__info">
              {" "}
              <div>
                {" "}
                <dt>Horário</dt> <dd>Qua a dom, 18h às 23h</dd>{" "}
              </div>{" "}
              <div>
                {" "}
                <dt>Telefone</dt> <dd>(31) 3222-0303</dd>{" "}
              </div>{" "}
            </dl>{" "}
            <div className="store__actions">
              {" "}
              <a
                href="tel:+553132220303"
                className="store__action store__action--primary"
              >
                {" "}
                Ligar{" "}
              </a>{" "}
              <a
                href="https://maps.google.com/?q=Rua+Fernao+Dias+77+Pampulha+Belo+Horizonte"
                className="store__action"
                target="_blank"
                rel="noopener"
              >
                {" "}
                Ver no mapa{" "}
              </a>{" "}
            </div>{" "}
          </article>{" "}
        </div>{" "}
      </section>
    </>
  );
}
