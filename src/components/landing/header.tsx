"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CartOpenButton } from "@/components/cart/cart-provider";
import { Icon } from "@/components/icon";
import type { StoreContact } from "@/lib/catalog-schema";
import { brazilianWhatsAppNumber } from "@/lib/contact";
const links = [
  ["inicio", "Início"],
  ["cardapio", "Cardápio"],
  ["sabores", "Sabores"],
  ["sobre", "Sobre"],
  ["atendimento", "Atendimento"],
];
export function Header({ contact }: { contact: StoreContact | null }) {
  const menu = useRef<HTMLDialogElement>(null);
  const [stuck, setStuck] = useState(false);
  const whatsappNumber = brazilianWhatsAppNumber(contact?.whatsapp);
  useEffect(() => {
    const update = () => setStuck(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <header className={`header${stuck ? " is-stuck" : ""}`}>
        <div className="header__inner container">
          <a href="#inicio" className="brand" aria-label="Pizzaria Nuclear">
            <Image
              className="brand__logo"
              src="/assets/logo/NuclearLogo.png"
              width={1448}
              height={1086}
              sizes="160px"
              alt=""
            />
          </a>
          <nav className="nav" aria-label="Navegação principal">
            {links.map(([id, text]) => (
              <a key={id} className="nav__link" href={`#${id}`}>
                {text}
              </a>
            ))}
            <a
              className="nav__search"
              href="#menu-search"
              aria-label="Buscar no cardápio"
            >
              <Icon name="search" className="icon--sm" />
            </a>
          </nav>
          <div className="header__actions">
            <CartOpenButton className="button button--icon header__cart" />
            <button
              className="button button--icon header__menu"
              aria-label="Abrir menu"
              aria-haspopup="dialog"
              onClick={() => menu.current?.showModal()}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>
      <dialog ref={menu} className="mobile-dialog" aria-label="Navegação móvel">
        <button
          className="button button--icon button--sm mobile-menu__close"
          aria-label="Fechar menu"
          onClick={() => menu.current?.close()}
        >
          <Icon name="close" />
        </button>
        <nav>
          {links.map(([id, text]) => (
            <a
              key={id}
              className="mobile-menu__link"
              href={`#${id}`}
              onClick={() => menu.current?.close()}
            >
              <span>{text}</span>
              <Icon name="arrow-right" />
            </a>
          ))}
        </nav>
        <div
          className="mobile-menu__foot"
          onClick={() => menu.current?.close()}
        >
          {whatsappNumber ? (
            <div className="social mobile-menu__social">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                className="social__link"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="whatsapp" className="icon--sm" />
              </a>
            </div>
          ) : null}
          <CartOpenButton className="button button--primary button--block">
            <Icon name="cart" />
            <span>Ver carrinho</span>
          </CartOpenButton>
        </div>
      </dialog>
    </>
  );
}
