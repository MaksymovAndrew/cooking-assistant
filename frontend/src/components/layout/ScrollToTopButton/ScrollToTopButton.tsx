import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { REDUCED_MOTION_QUERY } from "constants/motion";
import { SCROLL_TO_TOP_REVEAL_OFFSET_PX } from "constants/scrollToTop";

import { cx } from "utils/cx";

import styles from "./ScrollToTopButton.module.scss";

const ICON_SIZE = 20;

const prefersReducedMotion = (): boolean =>
    window.matchMedia(REDUCED_MOTION_QUERY).matches;

export const ScrollToTopButton = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > SCROLL_TO_TOP_REVEAL_OFFSET_PX);
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

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={t("nav.scrollToTop")}
            aria-hidden={!isVisible}
            className={cx(
                styles["scroll-to-top-button"],
                isVisible && styles["scroll-to-top-button--visible"],
            )}
        >
            <ArrowUp size={ICON_SIZE} aria-hidden="true" />
        </button>
    );
};
