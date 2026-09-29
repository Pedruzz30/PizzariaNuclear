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

    // guarda o texto pesquisável (nome, descrição e etiqueta)
    // para não varrer também o rótulo do botão a cada digitação
    const items =
        [...grid.querySelectorAll(".menu-item")].map((element) => {
            const parts = [
                ".menu-item__name",
                ".menu-item__description",
                ".menu-item__tag"
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

    filters.forEach((filter) => {
        filter.addEventListener("click", () => {
            activeCategory = filter.dataset.filter;

            filters.forEach((item) => {
                const isActive = item === filter;

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
        });
    });

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
