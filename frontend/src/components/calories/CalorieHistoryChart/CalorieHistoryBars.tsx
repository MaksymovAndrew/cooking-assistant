import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { HorizontalScrollbar } from "components/ui/HorizontalScrollbar";

import { formatKcal } from "utils/calories";
import {
    calorieToneFor,
    computeCalorieSummary,
} from "utils/computeCalorieSummary";
import type { DailyIntakeDay } from "utils/computeDailyIntake";

import styles from "./CalorieHistoryChart.module.scss";

interface CalorieHistoryBarsProps {
    days: DailyIntakeDay[];
    goal: number;
    range: "7" | "30";
    average: number;
    daysOnGoal: number;
}

const WEEKDAY_FORMAT = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const PERCENT_MULTIPLIER = 100;

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

export const CalorieHistoryBars: React.FC<CalorieHistoryBarsProps> = ({
    days,
    goal,
    range,
    average,
    daysOnGoal,
}) => {
    const { t } = useTranslation("calories");
    const barsRef = useRef<HTMLDivElement>(null);
    const hasHistory = days.some((day) => day.consumed > 0);

    useEffect(() => {
        // the row scrolls horizontally - default to showing today, not the oldest day
        if (barsRef.current) {
            barsRef.current.scrollLeft = barsRef.current.scrollWidth;
        }
    }, [range, days]);

    if (!hasHistory) {
        return (
            <p className={styles["calorie-history-chart__empty"]}>
                {t("dietaryTab.historyEmpty")}
            </p>
        );
    }

    const maxValue = Math.max(goal, ...days.map((day) => day.consumed), 1);
    const goalLinePercent = Math.min(
        (goal / maxValue) * PERCENT_MULTIPLIER,
        PERCENT_MULTIPLIER,
    );

    return (
        <>
            <div
                className={styles["calorie-history-chart__goal-line"]}
                style={{ bottom: `${goalLinePercent}%` }}
            />
            <div
                ref={barsRef}
                className={styles["calorie-history-chart__bars"]}
            >
                {days.map((day, index) => {
                    const isToday = index === days.length - 1;

                    return (
                        <div
                            key={day.date}
                            className={styles["calorie-history-chart__column"]}
                        >
                            {range === "7" && (
                                <span
                                    className={
                                        styles["calorie-history-chart__value"]
                                    }
                                >
                                    {formatKcal(day.consumed)}
                                </span>
                            )}
                            <div
                                className={barClass(day, goal, isToday)}
                                style={{
                                    height: `${(day.consumed / maxValue) * PERCENT_MULTIPLIER}%`,
                                }}
                            />
                            {range === "7" && (
                                <span className={dayLabelClass(isToday)}>
                                    {isToday
                                        ? t("dietaryTab.todayLabel")
                                        : WEEKDAY_FORMAT.format(
                                              new Date(day.date),
                                          )}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            <HorizontalScrollbar scrollRef={barsRef} />
            <div className={styles["calorie-history-chart__footer"]}>
                <span>
                    {t("dietaryTab.historyGoalLine", {
                        goal: formatKcal(goal),
                    })}
                </span>
                {range === "30" && (
                    <>
                        <span>
                            {t("dietaryTab.avgLabel", {
                                count: formatKcal(average),
                            })}
                        </span>
                        <span>
                            {t("dietaryTab.daysOnGoalLabel", {
                                onGoal: daysOnGoal,
                                total: days.length,
                            })}
                        </span>
                    </>
                )}
            </div>
        </>
    );
};
