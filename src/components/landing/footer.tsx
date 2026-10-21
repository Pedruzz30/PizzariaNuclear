"use client";

import { useState, type FormEvent } from "react";
import { brazilianWhatsAppNumber } from "@/lib/contact";
import type { StoreContact } from "@/lib/catalog-schema";
import { Icon } from "@/components/icon";

export function Footer({ contact }: { contact: StoreContact | null }) {
  const whatsappNumber = brazilianWhatsAppNumber(contact?.whatsapp);
  const [newsletterFeedback, setNewsletterFeedback] = useState<{
    kind: "error" | "success";
    message: string;
  } | null>(null);

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email")?.toString().trim() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setNewsletterFeedback({
        kind: "error",
        message: "Digite um e-mail válido para continuar.",
      });
      return;
    }
    setNewsletterFeedback({
      kind: "success",
      message: "Cadastro demonstrativo confirmado.",
    });
    form.reset();
  }
  return (
    <footer className="footer theme-dark">
      <div className="container">
        <span className="footer__word" aria-hidden="true">
          NUCL<em>E</em>AR
        </span>
        <div className="footer__top grid">
          <div className="footer__brand">
            <div
              className="footer__logo"
              role="img"
              aria-label="Pizzaria Nuclear"
            />
            <p className="footer__tagline">
              21 sabores de pizza, quatro tamanhos e opção de meio a meio.
            </p>
            {whatsappNumber ? (
              <div className="social footer__social">
                <a
                  className="social__link"
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  <Icon name="whatsapp" className="icon--sm" />
                </a>
              </div>
            ) : null}
          </div>
          <nav className="footer__nav footer__column" aria-label="Rodapé">
            <h2 className="label footer__heading">Navegar</h2>
            <a href="#cardapio">Cardápio</a>
            <a href="#sobre">Sobre</a>
            <a href="#atendimento">Atendimento</a>
          </nav>
          <div className="footer__contact footer__column">
            <h2 className="label footer__heading">Atendimento</h2>
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="phone" className="icon--sm" />
                WhatsApp
              </a>
            ) : (
              <span>Contato em confirmação</span>
            )}
            {contact?.phone ? (
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                <Icon name="phone" className="icon--sm" />
                {contact.phone}
              </a>
            ) : null}
          </div>
          <form
            className="footer__newsletter newsletter"
            onSubmit={submitNewsletter}
            noValidate
          >
            <h2 className="label footer__heading">Promoções no e-mail</h2>
            <p className="newsletter__text">
              Cadastre seu e-mail para acompanhar novidades da Nuclear.
            </p>
            <div className="field field--pill">
              <label className="visually-hidden" htmlFor="newsletter-email">
                Seu e-mail
              </label>
              <input
                className="field__input"
                id="newsletter-email"
                type="email"
                name="email"
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
              <button
                className="button button--icon button--sm field__submit"
                type="submit"
                aria-label="Assinar newsletter"
              >
                <Icon name="arrow-right" className="icon--sm" />
              </button>
            </div>
            <p
              className={`newsletter__feedback${newsletterFeedback ? ` newsletter__feedback--${newsletterFeedback.kind}` : ""}`}
              role="status"
            >
              {newsletterFeedback?.message}
            </p>
          </form>
        </div>
        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Pizzaria Nuclear.</p>
          <p>Dados comerciais em validação. Catálogo de homologação.</p>
        </div>
      </div>
    </footer>
  );
}
