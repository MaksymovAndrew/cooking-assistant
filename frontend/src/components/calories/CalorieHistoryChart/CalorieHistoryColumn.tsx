import React from "react";
import { useTranslation } from "react-i18next";

import { formatKcal } from "utils/calories";
import {
    calorieToneFor,
    computeCalorieSummary,
} from "utils/computeCalorieSummary";
import type { DailyIntakeDay } from "utils/computeDailyIntake";

import styles from "./CalorieHistoryChart.module.scss";

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const PERCENT_MULTIPLIER = 100;
const DASH = "—";

const barClass = (day: DailyIntakeDay, goal: number, isToday: boolean) => {
    const tone = calorieToneFor(
        computeCalorieSummary([{ calories: day.consumed }], goal),
    );

    return [
        styles["calorie-history-chart__bar"],
        styles[`calorie-history-chart__bar--${tone}`],
        isToday && styles["calorie-history-chart__bar--today"],
    ]
        .filter(Boolean)
        .join(" ");
};

const dayLabelClass = (isToday: boolean) =>
    [
        styles["calorie-history-chart__day-label"],
        isToday && styles["calorie-history-chart__day-label--today"],
    ]
        .filter(Boolean)
        .join(" ");

interface CalorieHistoryColumnProps {
    day: DailyIntakeDay;
    goal: number;
    maxValue: number;
    isToday: boolean;
    hasHistory: boolean;
    // the 30-day range has no room for per-day numbers or weekday labels
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

    return (
        <div className={styles["calorie-history-chart__column"]}>
            {showLabels && (
                <span className={styles["calorie-history-chart__value"]}>
                    {hasHistory ? formatKcal(day.consumed) : DASH}
                </span>
            )}
            <div
                className={barClass(day, goal, isToday)}
                style={{
                    height: `${(day.consumed / maxValue) * PERCENT_MULTIPLIER}%`,
                }}
            />
            {showLabels && (
                <span className={dayLabelClass(isToday)}>
                    {isToday
                        ? t("dietaryTab.todayLabel")
                        : WEEKDAY_FORMAT.format(new Date(day.date))}
                </span>
            )}
        </div>
    );
};
