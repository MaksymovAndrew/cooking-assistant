import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./CalorieHistoryChart.module.scss";

interface CalorieHistoryStreakProps {
    streak: number;
    best: number;
}

export const CalorieHistoryStreak: React.FC<CalorieHistoryStreakProps> = ({
    streak,
    best,
}) => {
    const { t } = useTranslation("calories");

    return (
        <div className={styles["calorie-history-chart__streak"]}>
            <span className={styles["calorie-history-chart__streak-value"]}>
                {streak}
            </span>
            <span className={styles["calorie-history-chart__streak-label"]}>
                {t("dietaryTab.streakLabel")}
            </span>
            {best > 0 && (
                <span className={styles["calorie-history-chart__streak-best"]}>
                    {t("dietaryTab.streakBest", { count: best })}
                </span>
            )}
        </div>
    );
};
