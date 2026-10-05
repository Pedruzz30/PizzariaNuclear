document.addEventListener("DOMContentLoaded", () => {

    // Troque pelo número real da pizzaria (formato internacional, só dígitos).
    const WHATSAPP_NUMBER = "553132220101";

    const STORAGE_KEY = "nuclear-cart";

    const drawer =
        document.querySelector("[data-cart]");

    const list =
        document.querySelector("[data-cart-list]");

    const emptyMessage =
        document.querySelector("[data-cart-empty]");

    const totalTarget =
        document.querySelector("[data-cart-total]");

    const countTargets =
        document.querySelectorAll("[data-cart-count]");

    const checkoutButton =
        document.querySelector("[data-cart-checkout]");

    if (!drawer || !list) return;

    let items = loadCart();
    let lastFocused = null;

    // =========================================================
    // STORAGE
    // =========================================================

    function loadCart() {
        try {
            const raw =
                window.localStorage.getItem(STORAGE_KEY);

            const parsed = raw ? JSON.parse(raw) : [];

            if (!Array.isArray(parsed)) return [];

            return parsed.filter((item) =>
                item &&
                typeof item.name === "string" &&
                Number.isFinite(item.price) &&
                Number.isFinite(item.quantity)
            );
        } catch (error) {
            return [];
        }
    }

    function saveCart() {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(items)
            );
        } catch (error) {
            // localStorage indisponível (aba anônima, cookies bloqueados).
        }
    }

    // =========================================================
    // CÁLCULOS
    // =========================================================

    function getTotal() {
        return items.reduce(
            (total, item) =>
                total + item.price * item.quantity,
            0
        );
    }

    function getCount() {
        return items.reduce(
            (total, item) => total + item.quantity,
            0
        );
    }

    // =========================================================
    // RENDER
    // =========================================================

    function render() {
        list.innerHTML = "";

        items.forEach((item, index) => {
            const row = document.createElement("li");

            row.className = "product product--cart";

            const name = document.createElement("span");

            name.className = "product__name";
            name.textContent = item.name;

            const price = document.createElement("span");

            price.className = "product__price";

            price.textContent =
                window.formatPrice(
                    item.price * item.quantity
                );

            const controls =
                document.createElement("div");

            controls.className = "product__controls";

            const minus =
                createControl("minus", "Diminuir quantidade");

            const quantity =
                document.createElement("span");

            quantity.className = "product__quantity";
            quantity.textContent = item.quantity;

            const plus =
                createControl("plus", "Aumentar quantidade");

            minus.addEventListener("click", () => {
                changeQuantity(index, -1);
            });

            plus.addEventListener("click", () => {
                changeQuantity(index, 1);
            });

            controls.append(minus, quantity, plus);

            const remove =
                document.createElement("button");

            remove.type = "button";
            remove.className = "product__remove";
            remove.textContent = "Remover";

            remove.setAttribute(
                "aria-label",
                `Remover ${item.name} do carrinho`
            );

            remove.addEventListener("click", () => {
                removeItem(index);
            });

            row.append(name, price, controls, remove);

            list.appendChild(row);
        });

        const isEmpty = items.length === 0;

        if (emptyMessage) {
            emptyMessage.hidden = !isEmpty;
        }

        if (checkoutButton) {
            checkoutButton.disabled = isEmpty;
        }

        if (totalTarget) {
            totalTarget.textContent =
                window.formatPrice(getTotal());
        }

        updateCount();
    }

    function createControl(iconName, ariaLabel) {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "product__step";
        button.innerHTML = window.icon(iconName, "icon--sm");

        button.setAttribute("aria-label", ariaLabel);

        return button;
    }

    function updateCount() {
        const count = getCount();

        countTargets.forEach((target) => {
            target.textContent = count;
        });

        if (window.gsap && count > 0) {
            gsap.fromTo(
                countTargets,
                {
                    scale: 1
                },
                {
                    scale: 1.45,
                    duration: 0.15,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.out"
                }
            );
        }
    }

    // =========================================================
    // AÇÕES
    // =========================================================

    function addItem(name, price) {
        const existing =
            items.find((item) => item.name === name);

        if (existing) {
            existing.quantity += 1;
        } else {
            items.push({
                name,
                price,
                quantity: 1
            });
        }

        saveCart();
        render();

        window.showToast(`${name} adicionada ao pedido`);
    }

    function changeQuantity(index, delta) {
        const item = items[index];

        if (!item) return;

        item.quantity += delta;

        if (item.quantity <= 0) {
            items.splice(index, 1);
        }

        saveCart();
        render();
    }

    function removeItem(index) {
        const item = items[index];

        if (!item) return;

        items.splice(index, 1);

        saveCart();
        render();

        window.showToast(`${item.name} removida do pedido`);
    }

    // =========================================================
    // DRAWER
    // =========================================================

    function openCart() {
        lastFocused = document.activeElement;

        drawer.hidden = false;

        // força o reflow para a transição rodar a partir do estado fechado
        void drawer.offsetWidth;

        drawer.classList.add("is-open");

        document.body.classList.add("is-locked");

        // o backdrop também tem data-cart-close, mas não recebe foco
        const closeButton =
            drawer.querySelector("button[data-cart-close]");

        if (closeButton) {
            closeButton.focus();
        }
    }

    function closeCart() {
        drawer.classList.remove("is-open");

        document.body.classList.remove("is-locked");

        setTimeout(() => {
            drawer.hidden = true;
        }, 420);

        if (lastFocused) {
            lastFocused.focus();
        }
    }

    document
        .querySelectorAll("[data-cart-open]")
        .forEach((button) => {
            button.addEventListener("click", openCart);
        });

    drawer
        .querySelectorAll("[data-cart-close]")
        .forEach((button) => {
            button.addEventListener("click", closeCart);
        });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            drawer.classList.contains("is-open")
        ) {
            closeCart();
        }
    });

    // =========================================================
    // BOTÕES DE ADICIONAR
    // =========================================================

    document
        .querySelectorAll("[data-add]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const name = button.dataset.name;

                const price =
                    parseFloat(button.dataset.price);

                if (!name || !Number.isFinite(price)) {
                    return;
                }

                addItem(name, price);

                // feedback visual: guarda o markup para restaurar
                // (os botões carregam ícones SVG, não só texto)
                if (button.dataset.restoring) return;

                const originalHTML = button.innerHTML;

                button.dataset.restoring = "true";
                button.classList.add("is-added");

                button.innerHTML =
                    button.classList.contains("product__add--circle")
                        ? window.icon("check")
                        : `<span>Adicionada</span>${window.icon("check", "icon--sm")}`;

                setTimeout(() => {
                    button.classList.remove("is-added");
                    button.innerHTML = originalHTML;

                    delete button.dataset.restoring;
                }, 900);
            });
        });

    // =========================================================
    // CHECKOUT
    // =========================================================

    if (checkoutButton) {
        checkoutButton.addEventListener("click", () => {
            if (items.length === 0) return;

            const lines = items.map(
                (item) =>
                    `• ${item.quantity}x ${item.name} — ` +
                    window.formatPrice(
                        item.price * item.quantity
                    )
            );

            const message =
                "Olá! Quero fazer um pedido na Nuclear:\n\n" +
                lines.join("\n") +
                `\n\nTotal: ${window.formatPrice(getTotal())}`;

            window.open(
                `https://wa.me/${WHATSAPP_NUMBER}?text=` +
                    encodeURIComponent(message),
                "_blank",
                "noopener"
            );
        });
    }

    render();
});
