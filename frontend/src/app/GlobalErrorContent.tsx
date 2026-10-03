"use client";

import React from "react";

import type { Locale } from "constants/locales";

import { useIsHydrated } from "hooks/useIsHydrated";

import { DonburiMarkStandard } from "components/icons";
import en from "i18n/locales/en/globalError.json";
import pl from "i18n/locales/pl/globalError.json";
import ru from "i18n/locales/ru/globalError.json";
import uk from "i18n/locales/uk/globalError.json";

import styles from "./GlobalErrorContent.module.scss";

// no i18n instance survives a crashed root layout, so this one tiny namespace is read directly
const COPY: Record<Locale, typeof en> = { en, pl, ru, uk };

const MARK_SIZE = 56;

interface GlobalErrorContentProps {
    locale: Locale;
    onRetry: () => void;
}

export const GlobalErrorContent: React.FC<GlobalErrorContentProps> = ({
    locale,
    onRetry,
}) => {
    const copy = COPY[locale];
    const isHydrated = useIsHydrated();

    return (
        <main className={styles["global-error"]}>
            <DonburiMarkStandard
                size={MARK_SIZE}
                className={styles["global-error__mark"]}
            />
            <h1 className={styles["global-error__title"]}>{copy.title}</h1>
            <p className={styles["global-error__description"]}>
                {copy.description}
            </p>
            <button
                type="button"
                className={styles["global-error__retry"]}
                disabled={!isHydrated}
                onClick={onRetry}
            >
                {copy.retry}
            </button>
        </main>
    );
};
