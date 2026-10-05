document.addEventListener("DOMContentLoaded", () => {
    const grid =
        document.querySelector("[data-menu-grid]");

    if (!grid) return;

    const filters =
        [...document.querySelectorAll(".menu__filter")];

    const searchInput =
        document.querySelector("[data-menu-search]");

    const emptyMessage =
        document.querySelector("[data-menu-empty]");

    const resetButton =
        document.querySelector("[data-menu-reset]");

    // guarda o texto pesquisável (nome, descrição e etiqueta)
    // para não varrer também o rótulo do botão a cada digitação
    const items =
        [...grid.querySelectorAll(".product--menu")].map((element) => {
            const parts = [
                ".product__name",
                ".product__ingredients",
                ".tag"
            ]
                .map((selector) => {
                    const node =
                        element.querySelector(selector);

                    return node ? node.textContent : "";
                })
                .join(" ");

            return {
                element,
                haystack: normalize(parts)
            };
        });

    let activeCategory = "todas";

    // =========================================================
    // HELPERS
    // =========================================================

    function normalize(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "");
    }

    function getSearchTerm() {
        return searchInput
            ? normalize(searchInput.value.trim())
            : "";
    }

    // =========================================================
    // FILTRO
    // =========================================================

    function applyFilters() {
        const term = getSearchTerm();

        let visibleCount = 0;

        items.forEach(({ element, haystack }) => {
            const matchesCategory =
                activeCategory === "todas" ||
                element.dataset.category === activeCategory;

            const matchesSearch =
                term === "" ||
                haystack.includes(term);

            const isVisible =
                matchesCategory && matchesSearch;

            element.hidden = !isVisible;

            if (isVisible) {
                visibleCount++;
            }
        });

        if (emptyMessage) {
            emptyMessage.hidden = visibleCount > 0;
        }
    }

    // =========================================================
    // CATEGORIAS
    // =========================================================

    function setCategory(category) {
        activeCategory = category;

        filters.forEach((item) => {
            const isActive =
                item.dataset.filter === category;

            item.classList.toggle(
                "menu__filter--active",
                isActive
            );

            item.setAttribute(
                "aria-pressed",
                isActive ? "true" : "false"
            );
        });

        applyFilters();
    }

    filters.forEach((filter) => {
        filter.addEventListener("click", () => {
            setCategory(filter.dataset.filter);
        });
    });

    // =========================================================
    // LIMPAR (estado vazio)
    // =========================================================

    if (resetButton) {
        resetButton.addEventListener("click", () => {
            if (searchInput) {
                searchInput.value = "";
            }

            setCategory("todas");

            if (searchInput) {
                searchInput.focus({ preventScroll: true });
            }
        });
    }

    // =========================================================
    // BUSCA
    // =========================================================

    if (searchInput) {
        let searchTimer;

        searchInput.addEventListener("input", () => {
            clearTimeout(searchTimer);

            searchTimer = setTimeout(applyFilters, 140);
        });
    }

    // =========================================================
    // ATALHO DA LUPA DO HEADER
    // =========================================================

    document
        .querySelectorAll("[data-search-open]")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const menuSection =
                    document.querySelector("#cardapio");

                if (menuSection) {
                    menuSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }

                if (searchInput) {
                    setTimeout(() => {
                        searchInput.focus({
                            preventScroll: true
                        });
                    }, 600);
                }
            });
        });

    applyFilters();
});
