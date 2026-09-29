document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    // =========================================================
    // MENU MOBILE
    // =========================================================

    const mobileMenu =
        document.querySelector("[data-menu]");

    const menuTrigger =
        document.querySelector("[data-menu-open]");

    function openMenu() {
        if (!mobileMenu) return;

        mobileMenu.hidden = false;

        void mobileMenu.offsetWidth;

        mobileMenu.classList.add("is-open");

        document.body.classList.add("is-locked");

        if (menuTrigger) {
            menuTrigger.setAttribute(
                "aria-expanded",
                "true"
            );
        }

        const closeButton =
            mobileMenu.querySelector("[data-menu-close]");

        if (closeButton) {
            closeButton.focus();
        }
    }

    function closeMenu() {
        if (!mobileMenu) return;

        mobileMenu.classList.remove("is-open");

        // o carrinho pode ter sido aberto a partir do menu:
        // nesse caso o scroll continua travado por ele
        const cart =
            document.querySelector("[data-cart]");

        const cartIsOpen =
            cart && cart.classList.contains("is-open");

        if (!cartIsOpen) {
            document.body.classList.remove("is-locked");
        }

        if (menuTrigger) {
            menuTrigger.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        setTimeout(() => {
            mobileMenu.hidden = true;
        }, 420);
    }

    if (menuTrigger) {
        menuTrigger.addEventListener("click", openMenu);
    }

    if (mobileMenu) {
        mobileMenu
            .querySelectorAll("[data-menu-close]")
            .forEach((button) => {
                button.addEventListener("click", closeMenu);
            });

        // qualquer link ou o botão do carrinho fecham o menu
        mobileMenu
            .querySelectorAll(
                ".mobile-menu__link, [data-cart-open]"
            )
            .forEach((element) => {
                element.addEventListener("click", closeMenu);
            });

        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                mobileMenu.classList.contains("is-open")
            ) {
                closeMenu();
            }
        });
    }

    // =========================================================
    // HEADER AO ROLAR
    // =========================================================

    const header =
        document.querySelector(".header");

    function updateHeader() {
        if (!header) return;

        header.classList.toggle(
            "is-stuck",
            window.scrollY > 40
        );
    }

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });

    updateHeader();

    // =========================================================
    // REVEAL AO ENTRAR NA TELA
    // =========================================================

    const revealTargets =
        document.querySelectorAll(".reveal");

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealTargets.forEach((target) => {
            target.classList.add("is-visible");
        });
    } else {
        const revealObserver =
            new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry, index) => {
                        if (!entry.isIntersecting) return;

                        // pequeno escalonamento dentro do mesmo lote
                        entry.target.style.transitionDelay =
                            `${Math.min(index, 5) * 70}ms`;

                        entry.target.classList.add(
                            "is-visible"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );
                    });
                },
                {
                    rootMargin: "0px 0px -12% 0px",
                    threshold: 0.12
                }
            );

        revealTargets.forEach((target) => {
            revealObserver.observe(target);
        });
    }

    // =========================================================
    // NAV ATIVA CONFORME A SEÇÃO
    // =========================================================

    const sections =
        [...document.querySelectorAll("main section[id]")];

    const navLinks =
        [...document.querySelectorAll(
            ".nav__link, .mobile-menu__link"
        )];

    function setActiveLink(id) {
        navLinks.forEach((link) => {
            const isActive =
                link.getAttribute("href") === `#${id}`;

            link.classList.toggle(
                "nav__link--active",
                isActive && link.classList.contains("nav__link")
            );

            link.classList.toggle(
                "mobile-menu__link--active",
                isActive &&
                    link.classList.contains("mobile-menu__link")
            );
        });
    }

    if (sections.length && "IntersectionObserver" in window) {
        const spy =
            new IntersectionObserver(
                (entries) => {
                    const visible = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        )[0];

                    if (visible) {
                        setActiveLink(visible.target.id);
                    }
                },
                {
                    rootMargin: "-45% 0px -45% 0px",
                    threshold: 0
                }
            );

        sections.forEach((section) => {
            spy.observe(section);
        });
    }

    // =========================================================
    // NEWSLETTER
    // =========================================================

    const newsletter =
        document.querySelector("[data-newsletter]");

    if (newsletter) {
        const feedback =
            newsletter.querySelector(
                "[data-newsletter-feedback]"
            );

        const input =
            newsletter.querySelector("input[type='email']");

        newsletter.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!input || !feedback) return;

            const isValid =
                /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
                    input.value.trim()
                );

            feedback.classList.remove(
                "newsletter__feedback--success",
                "newsletter__feedback--error"
            );

            if (!isValid) {
                feedback.textContent =
                    "Digite um e-mail válido para continuar.";

                feedback.classList.add(
                    "newsletter__feedback--error"
                );

                input.focus();

                return;
            }

            // Sem back-end: apenas confirma visualmente.
            feedback.textContent =
                "Pronto! Cupom a caminho do seu e-mail.";

            feedback.classList.add(
                "newsletter__feedback--success"
            );

            newsletter.reset();
        });
    }
});
