import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import styles from "./ScrollToTopButton.module.scss";

const ICON_SIZE = 20;
// the header is no longer sticky, so this is the way back to it once scrolled past it
const REVEAL_SCROLL_OFFSET_PX = 240;

const prefersReducedMotion = (): boolean =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const ScrollToTopButton = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > REVEAL_SCROLL_OFFSET_PX);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion() ? "auto" : "smooth",
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={t("nav.scrollToTop")}
            className={styles["scroll-to-top-button"]}
        >
            <ArrowUp size={ICON_SIZE} aria-hidden="true" />
        </button>
    );
};
