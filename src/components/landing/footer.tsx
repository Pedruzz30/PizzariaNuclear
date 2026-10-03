import Image from "next/image";
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          <Image
            src="/assets/logo/NuclearLogo.png"
            width={180}
            height={135}
            alt="Pizzaria Nuclear"
          />
          <p>
            Massa artesanal, forno a lenha e ingredientes que você reconhece.
          </p>
        </div>
        <nav className="footer__nav" aria-label="Rodapé">
          <div>
            <h2>Navegar</h2>
            <a href="#cardapio">Cardápio</a>
            <a href="#sobre">Sobre</a>
            <a href="#unidades">Unidades</a>
          </div>
          <div>
            <h2>Atendimento</h2>
            <a
              href="https://wa.me/553132220101"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            <a href="tel:+553132220101">(31) 3222-0101</a>
          </div>
        </nav>
        <div className="newsletter">
          <h2>Novidades da Nuclear</h2>
          <p className="newsletter__text">
            Acompanhe nossos canais de atendimento para saber mais sobre o
            cardápio.
          </p>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} Pizzaria Nuclear.</p>
        <p>Dados comerciais em validação. Catálogo de homologação.</p>
      </div>
    </footer>
  );
}
