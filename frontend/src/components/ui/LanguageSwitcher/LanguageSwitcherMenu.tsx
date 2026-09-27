import { Check } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { Locale } from "constants/locales";
import { LOCALE_NAMES, LOCALES } from "constants/locales";

import { menuKeyTarget } from "utils/menuKeyboard";

import styles from "./LanguageSwitcher.module.scss";

interface LanguageSwitcherMenuProps {
    current: Locale;
    align: "start" | "end";
    onChoose: (locale: Locale) => void;
}

const CHECK_SIZE = 16;

export const LanguageSwitcherMenu: React.FC<LanguageSwitcherMenuProps> = ({
    current,
    align,
    onChoose,
}) => {
    const { t } = useTranslation();
    const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

    // opening from the keyboard lands on the language already in use
    useEffect(() => {
        itemsRef.current[LOCALES.indexOf(current)]?.focus();
    }, [current]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const index = itemsRef.current.findIndex(
            (item) => item === document.activeElement,
        );
        const target = menuKeyTarget(event.key, index, LOCALES.length);

        if (target !== null) {
            event.preventDefault();
            itemsRef.current[target]?.focus();
        }
    };

    return (
        <div
            role="menu"
            tabIndex={-1}
            aria-label={t("languageSwitcher.menu")}
            onKeyDown={handleKeyDown}
            className={[
                styles["language-switcher__menu"],
                styles[`language-switcher__menu--${align}`],
            ].join(" ")}
        >
            {LOCALES.map((locale, index) => (
                <button
                    key={locale}
                    ref={(item) => {
                        itemsRef.current[index] = item;
                    }}
                    type="button"
                    role="menuitemradio"
                    aria-checked={locale === current}
                    lang={locale}
                    onClick={() => {
                        onChoose(locale);
                    }}
                    className={styles["language-switcher__item"]}
                >
                    {LOCALE_NAMES[locale]}
                    {locale === current && (
                        <Check size={CHECK_SIZE} aria-hidden="true" />
                    )}
                </button>
            ))}
        </div>
    );
};
