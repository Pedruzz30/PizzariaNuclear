document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined") {
        console.warn(
            "GSAP não foi carregado. As animações do hero foram ignoradas."
        );

        return;
    }

    const reduceMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (reduceMotion) {
        return;
    }

    // =========================================================
    // SPLIT TITLE INTO LETTERS
    // =========================================================

    const heroWords =
        document.querySelectorAll(".hero-word");

    heroWords.forEach((word) => {
        const text = word.textContent.trim();

        word.innerHTML = "";

        [...text].forEach((letter) => {
            const span = document.createElement("span");

            span.classList.add("hero-letter");
            span.textContent = letter;

            word.appendChild(span);
        });
    });

    // =========================================================
    // SPLIT DESCRIPTION INTO WORDS
    // =========================================================

    const description =
        document.querySelector(".hero__description");

    if (description) {
        const originalHTML = description.innerHTML;

        // preserva strong, mas separa os nós de texto depois
        const walker =
            document.createTreeWalker(
                description,
                NodeFilter.SHOW_TEXT
            );

        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach((node) => {
            const words =
                node.textContent
                    .split(/(\s+)/)
                    .filter(Boolean);

            const fragment =
                document.createDocumentFragment();

            words.forEach((word) => {
                if (/^\s+$/.test(word)) {
                    fragment.appendChild(
                        document.createTextNode(word)
                    );

                    return;
                }

                const span =
                    document.createElement("span");

                span.classList.add(
                    "hero-description-word"
                );

                span.textContent = word;

                fragment.appendChild(span);
            });

            node.replaceWith(fragment);
        });
    }

    // =========================================================
    // REQUIRED INLINE STYLES
    // =========================================================

    gsap.set(".hero-word", {
        overflow: "hidden"
    });

    gsap.set(".hero-letter", {
        display: "inline-block",
        transformOrigin: "50% 100%"
    });

    gsap.set(".hero-description-word", {
        display: "inline-block"
    });

    // =========================================================
    // INITIAL STATES
    // =========================================================

    gsap.set(".brand", {
        opacity: 0,
        y: -25
    });

    gsap.set(".nav", {
        opacity: 0,
        y: -45,
        scale: 0.96
    });

    gsap.set(".header__actions", {
        opacity: 0,
        y: -25
    });

    gsap.set(".hero__eyebrow", {
        opacity: 0,
        y: 18
    });

    gsap.set(".hero-letter", {
        opacity: 0,
        yPercent: 120,
        rotate: 4
    });

    gsap.set(".hero-description-word", {
        opacity: 0,
        y: 12
    });

    gsap.set(".hero__buttons", {
        opacity: 0,
        y: 25
    });

    gsap.set(".hero__circle", {
        opacity: 0,
        scale: 0.75
    });

    gsap.set(".hero__pizza", {
        opacity: 0,
        scale: 1.1,
        x: 130,
        rotate: 5
    });

    gsap.set(".hero__seal", {
        opacity: 0,
        scale: 0.5,
        rotate: -40
    });

    gsap.set(".hero .social__link", {
        opacity: 0,
        x: 45
    });

    gsap.set(".pizza-card", {
        opacity: 0,
        y: 130,
        scale: 0.88
    });

    gsap.set(".carousel__controls", {
        opacity: 0,
        y: 20
    });

    gsap.set(".scroll-indicator", {
        opacity: 0,
        y: -20
    });

    gsap.set(".hero__signature", {
        opacity: 0,
        x: 30
    });

    // =========================================================
    // MAIN TIMELINE
    // =========================================================

    const timeline = gsap.timeline({
        defaults: {
            ease: "power3.out"
        }
    });

    // Header
    timeline.to(
        ".brand",
        {
            opacity: 1,
            y: 0,
            duration: 0.85
        },
        0
    );

    timeline.to(
        ".nav",
        {
            opacity: 1,
            y: 0,
            scale: 1,

            duration: 1.25,
            ease: "power4.out"
        },
        0
    );

    timeline.to(
        ".header__actions",
        {
            opacity: 1,
            y: 0,

            duration: 1
        },
        0.1
    );

    // Background circle
    timeline.to(
        ".hero__circle",
        {
            opacity: 1,
            scale: 1,

            duration: 1.35,
            ease: "power4.out"
        },
        0.05
    );

    // Main pizza
    timeline.to(
        ".hero__pizza",
        {
            opacity: 1,

            scale: 1,

            x: 0,

            rotate: -2,

            duration: 1.4,

            ease: "power4.out"
        },
        0.08
    );

    // Eyebrow
    timeline.to(
        ".hero__eyebrow",
        {
            opacity: 1,
            y: 0,

            duration: 0.45
        },
        0.25
    );

    // =========================================================
    // HEADLINE
    // =========================================================

    const word1 =
        document.querySelectorAll(
            ".hero-word:nth-child(1) .hero-letter"
        );

    const word2 =
        document.querySelectorAll(
            ".hero-word:nth-child(2) .hero-letter"
        );

    const word3 =
        document.querySelectorAll(
            ".hero-word:nth-child(3) .hero-letter"
        );

    timeline.to(
        word1,
        {
            opacity: 1,

            yPercent: 0,

            rotate: 0,

            duration: 0.3,

            stagger: 0.05,

            ease: "power2.out"
        },
        0.12
    );

    timeline.to(
        word2,
        {
            opacity: 1,

            yPercent: 0,

            rotate: 0,

            duration: 0.3,

            stagger: 0.05,

            ease: "power2.out"
        },
        0.28
    );

    timeline.to(
        word3,
        {
            opacity: 1,

            yPercent: 0,

            rotate: 0,

            duration: 0.3,

            stagger: 0.05,

            ease: "power2.out"
        },
        0.43
    );

    // =========================================================
    // SEAL
    // =========================================================

    timeline.to(
        ".hero__seal",
        {
            opacity: 1,

            scale: 1,

            rotate: -8,

            duration: 1.25,

            ease: "power4.out"
        },
        0.15
    );

    // =========================================================
    // SOCIAL
    // =========================================================

    timeline.to(
        ".hero .social__link",
        {
            opacity: 1,

            x: 0,

            duration: 1,

            stagger: 0.08,

            ease: "power4.out"
        },
        0.2
    );

    // =========================================================
    // DESCRIPTION — WORD BY WORD
    //
    // Figma:
    // começa ~0.4s
    // diferença ~0.075s
    // duração ~0.3s
    // =========================================================

    timeline.to(
        ".hero-description-word",
        {
            opacity: 1,

            y: 0,

            duration: 0.3,

            stagger: 0.075,

            ease: "power2.out"
        },
        0.4
    );

    // =========================================================
    // PRODUCT CARDS
    // =========================================================

    timeline.to(
        ".pizza-card",
        {
            opacity: 1,

            y: 0,

            scale: 1,

            duration: 1.25,

            stagger: 0.12,

            ease: "power4.out",

            clearProps: "transform"
        },
        0.6
    );

    timeline.to(
        ".carousel__controls",
        {
            opacity: 1,

            y: 0,

            duration: 0.8
        },
        0.95
    );

    // =========================================================
    // CTA
    // =========================================================

    timeline.to(
        ".hero__buttons",
        {
            opacity: 1,

            y: 0,

            duration: 0.75
        },
        1.05
    );

    // =========================================================
    // SECONDARY UI
    // =========================================================

    timeline.to(
        ".scroll-indicator",
        {
            opacity: 1,

            y: 0,

            duration: 0.7
        },
        1.25
    );

    timeline.to(
        ".hero__signature",
        {
            opacity: 1,

            x: 0,

            duration: 0.8
        },
        1.2
    );

    // =========================================================
    // IDLE EFFECTS
    // =========================================================

    timeline.call(() => {
        startIdleAnimations();
    });


    function startIdleAnimations() {
        // pizza respirando quase imperceptivelmente
        gsap.to(".hero__pizza", {
            y: -8,

            duration: 3.5,

            repeat: -1,
            yoyo: true,

            ease: "sine.inOut"
        });

        // selo girando muito devagar
        gsap.to(".hero__seal", {
            rotate: 2,

            duration: 6,

            repeat: -1,
            yoyo: true,

            ease: "sine.inOut"
        });

        // seta de scroll
        gsap.to(".scroll-indicator", {
            y: 7,

            duration: 1.3,

            repeat: -1,
            yoyo: true,

            ease: "sine.inOut"
        });
    }

    // =========================================================
    // MOUSE PARALLAX
    // =========================================================

    if (
        window.matchMedia(
            "(pointer: fine)"
        ).matches
    ) {
        window.addEventListener(
            "mousemove",
            (event) => {
                const x =
                    event.clientX /
                        window.innerWidth -
                    0.5;

                const y =
                    event.clientY /
                        window.innerHeight -
                    0.5;

                gsap.to(".hero__pizza", {
                    x: x * 16,
                    y: y * 10 - 8,

                    duration: 1.2,

                    ease: "power3.out",

                    overwrite: "auto"
                });

                gsap.to(".hero__seal", {
                    x: x * -12,
                    y: y * -10,

                    duration: 1.5,

                    ease: "power3.out",

                    overwrite: "auto"
                });
            }
        );
    }
});