import Image from "next/image";
import { brazilianWhatsAppNumber } from "@/lib/contact";
import type { StoreContact } from "@/lib/catalog-schema";
export function Footer({ contact }: { contact: StoreContact | null }) {
  const whatsappNumber = brazilianWhatsAppNumber(contact?.whatsapp);
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
          <p>21 sabores de pizza, quatro tamanhos e opção de meio a meio.</p>
        </div>
        <nav className="footer__nav" aria-label="Rodapé">
          <div>
            <h2>Navegar</h2>
            <a href="#cardapio">Cardápio</a>
            <a href="#sobre">Sobre</a>
            <a href="#atendimento">Atendimento</a>
          </div>
          <div>
            <h2>Atendimento</h2>
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            ) : (
              <p>Contato em confirmação</p>
            )}
            {contact?.phone ? (
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                {contact.phone}
              </a>
            ) : null}
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
