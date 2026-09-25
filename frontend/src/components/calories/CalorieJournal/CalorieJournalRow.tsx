import React from "react";
import { useTranslation } from "react-i18next";

import type { CalorieIntakeItem } from "types/calorie";

import { useLocale } from "hooks/useLocale";

import { TrashMark, UtensilsMarkSimple } from "components/icons";

import { formatKcal } from "utils/calories";
import { formatRelativeTime } from "utils/dateUtils";

import styles from "./CalorieJournal.module.scss";

interface CalorieJournalRowProps {
    entry: CalorieIntakeItem;
    onDelete: (entry: CalorieIntakeItem) => void;
}

const TRASH_ICON_SIZE = 15;
const UTENSILS_ICON_SIZE = 16;

export const CalorieJournalRow: React.FC<CalorieJournalRowProps> = ({
    entry,
    onDelete,
}) => {
    const { t } = useTranslation("calories");
    const locale = useLocale();
    const title =
        entry.portions > 1
            ? t("dietaryTab.journalPortions", { count: entry.portions }) +
              ` ${entry.title}`
            : entry.title;

    return (
        <li className={styles["calorie-journal__row"]}>
            <span className={styles["calorie-journal__icon"]}>
                <UtensilsMarkSimple size={UTENSILS_ICON_SIZE} />
            </span>
            <span className={styles["calorie-journal__body"]}>
                <span className={styles["calorie-journal__title"]}>
                    {title}
                </span>
                <span className={styles["calorie-journal__time"]}>
                    {formatRelativeTime(t, entry.eaten_at)}
                </span>
            </span>
            <span className={styles["calorie-journal__calories"]}>
                <span>{formatKcal(entry.calories, locale)}</span>
                <span className={styles["calorie-journal__unit"]}>
                    {t("dietaryTab.kcalUnit")}
                </span>
            </span>
            <button
                type="button"
                aria-label={t("dietaryTab.deleteEntry")}
                className={styles["calorie-journal__delete"]}
                onClick={() => {
                    onDelete(entry);
                }}
            >
                <TrashMark size={TRASH_ICON_SIZE} />
            </button>
        </li>
    );
};
