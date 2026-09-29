document.addEventListener("DOMContentLoaded", () => {
    const carousel =
        document.querySelector(".carousel");

    if (!carousel) return;

    const track =
        carousel.querySelector(".carousel__track");

    const previousButton =
        carousel.querySelector(
            ".carousel__arrow--prev"
        );

    const nextButton =
        carousel.querySelector(
            ".carousel__arrow--next"
        );

    const cards =
        [...carousel.querySelectorAll(".pizza-card")];

    if (
        !track ||
        !previousButton ||
        !nextButton ||
        cards.length === 0
    ) {
        return;
    }

    let currentIndex = 0;

    // =========================================================
    // HELPERS
    // =========================================================

    function isMobile() {
        return window.innerWidth <= 820;
    }

    function getCardStep() {
        const firstCard = cards[0];

        const styles =
            window.getComputedStyle(track);

        const gap =
            parseFloat(styles.columnGap) ||
            parseFloat(styles.gap) ||
            0;

        return (
            firstCard.getBoundingClientRect().width +
            gap
        );
    }

    // =========================================================
    // DESKTOP
    // =========================================================

    function moveDesktopCarousel() {
        const step = getCardStep();

        const trackWidth = track.scrollWidth;
        const visibleWidth = carousel.clientWidth;

        const maxTranslation =
            Math.max(
                0,
                trackWidth - visibleWidth
            );

        let target =
            currentIndex * step;

        target =
            Math.min(
                target,
                maxTranslation
            );

        if (window.gsap) {
            gsap.to(track, {
                x: -target,

                duration: 0.85,

                ease: "power4.out"
            });
        } else {
            track.style.transform =
                `translateX(${-target}px)`;
        }

        updateButtons();
    }

    // =========================================================
    // MOBILE
    // =========================================================

    function moveMobileCarousel(direction) {
        const distance =
            getCardStep();

        track.scrollBy({
            left:
                direction * distance,

            behavior: "smooth"
        });
    }

    // =========================================================
    // BUTTON STATE
    // =========================================================

    function updateButtons() {
        previousButton.style.opacity =
            currentIndex === 0
                ? "0.4"
                : "1";

        previousButton.style.pointerEvents =
            currentIndex === 0
                ? "none"
                : "auto";

        const maxIndex =
            Math.max(
                0,
                cards.length - 2
            );

        nextButton.style.opacity =
            currentIndex >= maxIndex
                ? "0.4"
                : "1";
    }

    // =========================================================
    // NEXT
    // =========================================================

    nextButton.addEventListener(
        "click",
        () => {
            if (isMobile()) {
                moveMobileCarousel(1);

                return;
            }

            const maxIndex =
                Math.max(
                    0,
                    cards.length - 2
                );

            currentIndex =
                Math.min(
                    currentIndex + 1,
                    maxIndex
                );

            moveDesktopCarousel();
        }
    );

    // =========================================================
    // PREVIOUS
    // =========================================================

    previousButton.addEventListener(
        "click",
        () => {
            if (isMobile()) {
                moveMobileCarousel(-1);

                return;
            }

            currentIndex =
                Math.max(
                    currentIndex - 1,
                    0
                );

            moveDesktopCarousel();
        }
    );

    // =========================================================
    // KEYBOARD
    // =========================================================

    carousel.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "ArrowRight") {
                nextButton.click();
            }

            if (event.key === "ArrowLeft") {
                previousButton.click();
            }
        }
    );

    // =========================================================
    // DRAG / SWIPE
    // =========================================================

    let startX = 0;
    let endX = 0;

    track.addEventListener(
        "pointerdown",
        (event) => {
            startX = event.clientX;
        }
    );

    track.addEventListener(
        "pointerup",
        (event) => {
            endX = event.clientX;

            const distance =
                startX - endX;

            const threshold = 50;

            if (
                distance > threshold
            ) {
                nextButton.click();
            }

            if (
                distance < -threshold
            ) {
                previousButton.click();
            }
        }
    );

    // =========================================================
    // RESIZE
    // =========================================================

    let resizeTimer;

    window.addEventListener(
        "resize",
        () => {
            clearTimeout(
                resizeTimer
            );

            resizeTimer =
                setTimeout(() => {
                    if (window.gsap) {
                        gsap.set(
                            track,
                            {
                                clearProps:
                                    "transform"
                            }
                        );
                    } else {
                        track.style.transform =
                            "";
                    }

                    currentIndex = 0;

                    updateButtons();
                }, 150);
        }
    );

    updateButtons();
});