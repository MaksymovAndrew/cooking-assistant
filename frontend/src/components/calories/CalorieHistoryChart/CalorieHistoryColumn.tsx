import React from "react";
import { useTranslation } from "react-i18next";

import { useLocale } from "hooks/useLocale";

import {
    barHeightPercent,
    dayTone,
    formatHistoryDay,
    formatWeekday,
} from "utils/calorieHistory";
import { formatKcal } from "utils/calories";
import type { DailyIntakeDay } from "utils/computeDailyIntake";
import { cx } from "utils/cx";

import styles from "./CalorieHistoryChart.module.scss";

const DASH = "—";

const barClass = (day: DailyIntakeDay, goal: number, isToday: boolean) =>
    cx(
        styles["calorie-history-chart__bar"],
        styles[`calorie-history-chart__bar--${dayTone(day, goal)}`],
        isToday && styles["calorie-history-chart__bar--today"],
    );

const dayLabelClass = (isToday: boolean) =>
    cx(
        styles["calorie-history-chart__day-label"],
        isToday && styles["calorie-history-chart__day-label--today"],
    );

interface CalorieHistoryColumnProps {
    day: DailyIntakeDay;
    goal: number;
    maxValue: number;
    isToday: boolean;
    hasHistory: boolean;
    showLabels: boolean;
}

export const CalorieHistoryColumn: React.FC<CalorieHistoryColumnProps> = ({
    day,
    goal,
    maxValue,
    isToday,
    hasHistory,
    showLabels,
}) => {
    const { t } = useTranslation("calories");
    const locale = useLocale();
    const kcal = formatKcal(day.consumed, locale);

    return (
        <div className={styles["calorie-history-chart__column"]}>
            {showLabels && (
                <span
                    className={styles["calorie-history-chart__value"]}
                    aria-hidden="true"
                >
                    {hasHistory ? kcal : DASH}
                </span>
            )}
            <div
                role="img"
                aria-label={t("dietaryTab.barLabel", {
                    day: formatHistoryDay(day.date, locale),
                    kcal,
                })}
                className={barClass(day, goal, isToday)}
                style={{
                    height: `${barHeightPercent(day.consumed, maxValue)}%`,
                }}
            />
            {showLabels && (
                <span className={dayLabelClass(isToday)} aria-hidden="true">
                    {isToday
                        ? t("dietaryTab.todayLabel")
                        : formatWeekday(day.date, locale)}
                </span>
            )}
        </div>
    );
};
