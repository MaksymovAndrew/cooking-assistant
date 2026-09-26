import { ChevronDown, Languages } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { LOCALE_BADGES, LOCALE_NAMES } from "constants/locales";

import { useIsHydrated } from "hooks/useIsHydrated";
import { useLocale } from "hooks/useLocale";
import { usePopoverDismiss } from "hooks/usePopoverDismiss";
import { useSwitchLocale } from "hooks/useSwitchLocale";

import styles from "./LanguageSwitcher.module.scss";
import { LanguageSwitcherMenu } from "./LanguageSwitcherMenu";

interface LanguageSwitcherProps {
    // which edge of the trigger the menu lines up with
    align?: "start" | "end";
}

const ICON_SIZE = 16;
const CHEVRON_SIZE = 14;

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
    align = "end",
}) => {
    const { t } = useTranslation();
    const locale = useLocale();
    const switchLocale = useSwitchLocale();
    const isHydrated = useIsHydrated();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const closeMenu = () => {
        setIsOpen(false);
    };

    usePopoverDismiss(containerRef, isOpen, closeMenu);

    return (
        <div ref={containerRef} className={styles["language-switcher"]}>
            <button
                type="button"
                onClick={() => {
                    setIsOpen((prev) => !prev);
                }}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label={t("languageSwitcher.trigger", {
                    language: LOCALE_NAMES[locale],
                })}
                // on screen from the server render; until React hydrates this opens nothing
                disabled={!isHydrated}
                className={styles["language-switcher__trigger"]}
            >
                <Languages size={ICON_SIZE} aria-hidden="true" />
                <span className={styles["language-switcher__code"]}>
                    {LOCALE_BADGES[locale]}
                </span>
                <ChevronDown
                    size={CHEVRON_SIZE}
                    aria-hidden="true"
                    className={styles["language-switcher__chevron"]}
                />
            </button>
            {isOpen && (
                <LanguageSwitcherMenu
                    current={locale}
                    align={align}
                    onChoose={(next) => {
                        closeMenu();
                        void switchLocale(next);
                    }}
                />
            )}
        </div>
    );
};
