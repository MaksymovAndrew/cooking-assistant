import React from "react";
import { useTranslation } from "react-i18next";

import type { CalorieIntakeItem } from "types/calorie";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import { formatKcal } from "utils/calories";

import styles from "./CalorieJournal.module.scss";
import { CalorieJournalRow } from "./CalorieJournalRow";

interface CalorieJournalProps {
    entries: CalorieIntakeItem[];
}

export const CalorieJournal: React.FC<CalorieJournalProps> = ({ entries }) => {
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
                    {entries.map((entry) => (
                        <CalorieJournalRow
                            key={entry.id}
                            entry={entry}
                            onDelete={openDeleteModal}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};
