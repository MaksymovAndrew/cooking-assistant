import React from "react";
import { useTranslation } from "react-i18next";

import type { CalorieIntakeItem } from "types/calorie";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { TrashMark, UtensilsMarkSimple } from "components/icons";

import { formatKcal } from "utils/calories";
import { formatRelativeTime } from "utils/dateUtils";

import styles from "./CalorieJournal.module.scss";

interface CalorieJournalProps {
    entries: CalorieIntakeItem[];
    mealLimit: number | null;
}

const TRASH_ICON_SIZE = 15;
const UTENSILS_ICON_SIZE = 16;

export const CalorieJournal: React.FC<CalorieJournalProps> = ({
    entries,
    mealLimit,
}) => {
    const { t } = useTranslation("calories");
    const dispatch = useAppDispatch();
    const total = entries.reduce((sum, entry) => sum + entry.calories, 0);

    const openDeleteModal = (entry: CalorieIntakeItem) => {
        dispatch(
            openModal({
                type: MODAL_TYPE.deleteCalorieIntake,
                intakeId: entry.id,
                title: entry.title,
            }),
        );
    };

    return (
        <div className={styles["calorie-journal"]}>
            <div className={styles["calorie-journal__header"]}>
                <h3 className={styles["calorie-journal__heading"]}>
                    {t("dietaryTab.journalHeading")}
                </h3>
                <span className={styles["calorie-journal__meta"]}>
                    {t("dietaryTab.journalMeta", {
                        count: entries.length,
                        calories: formatKcal(total),
                    })}
                </span>
            </div>

            {entries.length === 0 ? (
                <p className={styles["calorie-journal__empty"]}>
                    {t("dietaryTab.journalEmpty")}
                </p>
            ) : (
                <ul className={styles["calorie-journal__list"]}>
                    {entries.map((entry) => {
                        const isOverMealLimit =
                            mealLimit !== null && entry.calories > mealLimit;
                        const time = formatRelativeTime(entry.eaten_at);
                        const timeLabel = isOverMealLimit
                            ? `${time} · ${t("dietaryTab.overMealLimitSuffix")}`
                            : time;

                        return (
                            <li
                                key={entry.id}
                                className={styles["calorie-journal__row"]}
                            >
                                <span
                                    className={styles["calorie-journal__icon"]}
                                >
                                    <UtensilsMarkSimple
                                        size={UTENSILS_ICON_SIZE}
                                    />
                                </span>
                                <span
                                    className={styles["calorie-journal__body"]}
                                >
                                    <span
                                        className={
                                            styles["calorie-journal__title"]
                                        }
                                    >
                                        {entry.portions > 1
                                            ? t("dietaryTab.journalPortions", {
                                                  count: entry.portions,
                                              }) + ` ${entry.title}`
                                            : entry.title}
                                    </span>
                                    <span
                                        className={[
                                            styles["calorie-journal__time"],
                                            isOverMealLimit &&
                                                styles[
                                                    "calorie-journal__time--warning"
                                                ],
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        {timeLabel}
                                    </span>
                                </span>
                                <span
                                    className={
                                        styles["calorie-journal__calories"]
                                    }
                                >
                                    <span>{formatKcal(entry.calories)}</span>
                                    <span
                                        className={
                                            styles["calorie-journal__unit"]
                                        }
                                    >
                                        {t("dietaryTab.kcalUnit")}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    aria-label={t("dietaryTab.deleteEntry")}
                                    className={
                                        styles["calorie-journal__delete"]
                                    }
                                    onClick={() => {
                                        openDeleteModal(entry);
                                    }}
                                >
                                    <TrashMark size={TRASH_ICON_SIZE} />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};
