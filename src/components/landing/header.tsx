"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CartOpenButton } from "@/components/cart/cart-provider";
const links = [
  ["inicio", "Início"],
  ["cardapio", "Cardápio"],
  ["sabores", "Sabores"],
  ["sobre", "Sobre"],
  ["atendimento", "Atendimento"],
];
export function Header() {
  const menu = useRef<HTMLDialogElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const update = () => setStuck(window.scrollY > 32);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <header className={`header${stuck ? " is-stuck" : ""}`}>
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
            ⌕
          </a>
        </nav>
        <div className="header__actions">
          <CartOpenButton />
          <button
            className="header__menu"
            aria-label="Abrir menu"
            aria-haspopup="dialog"
            onClick={() => menu.current?.showModal()}
          >
            ☰
          </button>
        </div>
      </header>
      <dialog ref={menu} className="mobile-dialog" aria-label="Navegação móvel">
        <button
          className="mobile-menu__close"
          aria-label="Fechar menu"
          onClick={() => menu.current?.close()}
        >
          ✕
        </button>
        <nav>
          {links.map(([id, text]) => (
            <a
              key={id}
              className="mobile-menu__link"
              href={`#${id}`}
              onClick={() => menu.current?.close()}
            >
              {text}
            </a>
          ))}
        </nav>
      </dialog>
    </>
  );
}
