// =========================================================
// ICON
// Returns the markup for a sprite icon (see index.html).
// Used by cart.js when rendering controls dynamically.
// =========================================================

window.icon = function icon(name, extraClass = "") {
    const className = extraClass
        ? `icon ${extraClass}`
        : "icon";

    return (
        `<svg class="${className}" aria-hidden="true">` +
        `<use href="#icon-${name}"/>` +
        `</svg>`
    );
};

// =========================================================
// TOAST
// Exposto globalmente para o carrinho e o restante da UI.
// =========================================================

window.showToast = (function () {
    let hideTimer;

    return function showToast(message) {
        const toast =
            document.querySelector("[data-toast]");

        if (!toast) return;

        toast.textContent = message;

        toast.classList.add("is-visible");

        clearTimeout(hideTimer);

        hideTimer = setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 2600);
    };
})();

// =========================================================
// PREÇO
// =========================================================

window.formatPrice = function formatPrice(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
};

document.addEventListener("DOMContentLoaded", () => {

    // =========================================================
    // SMOOTH SCROLL
    // =========================================================

    const internalLinks =
        document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    // =========================================================
    // CARD TILT LEVE
    // Só no modo desktop editorial (>= 1200px) e com mouse.
    // =========================================================

    const desktopPointer =
        window.matchMedia(
            "(min-width: 1200px) and (pointer: fine)"
        );

    const cards =
        document.querySelectorAll(".carousel .product");

    cards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            if (!desktopPointer.matches) return;

            const rect = card.getBoundingClientRect();

            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY =
                ((mouseX - centerX) / centerX) * 3;

            const rotateX =
                ((centerY - mouseY) / centerY) * 3;

            card.style.transform = `
                perspective(800px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-8px)
            `;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
        });
    });

    // =========================================================
    // ANO DO RODAPÉ
    // =========================================================

    const yearTarget =
        document.querySelector("[data-year]");

    if (yearTarget) {
        yearTarget.textContent =
            new Date().getFullYear();
    }

    // =========================================================
    // PAGE READY
    // =========================================================

    document.body.classList.add("page-ready");
});
