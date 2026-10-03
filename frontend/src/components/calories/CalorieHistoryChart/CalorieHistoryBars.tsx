import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useLocale } from "hooks/useLocale";

import { HorizontalScrollbar } from "components/ui/HorizontalScrollbar";

import { goalLinePercent, historyMaxValue } from "utils/calorieHistory";
import { formatKcal } from "utils/calories";
import type { DailyIntakeDay } from "utils/computeDailyIntake";
import { cx } from "utils/cx";

import styles from "./CalorieHistoryChart.module.scss";
import { CalorieHistoryColumn } from "./CalorieHistoryColumn";

interface CalorieHistoryBarsProps {
    days: DailyIntakeDay[];
    goal: number;
    range: "7" | "30";
    average: number;
    daysOnGoal: number;
}

const DASH = "—";

// the bars and footer always render, so the card's height never changes when empty
export const CalorieHistoryBars: React.FC<CalorieHistoryBarsProps> = ({
    days,
    goal,
    range,
    average,
    daysOnGoal,
}) => {
    const { t } = useTranslation("calories");
    const locale = useLocale();
    const barsRef = useRef<HTMLDivElement>(null);
    const hasHistory = days.some((day) => day.consumed > 0);
    const isWeek = range === "7";

    useEffect(() => {
        if (barsRef.current) {
            barsRef.current.scrollLeft = barsRef.current.scrollWidth;
        }
    }, [range, days]);

    const maxValue = historyMaxValue(goal, days);
    const goalLineBottom = hasHistory ? goalLinePercent(goal, maxValue) : 0;

    return (
        <>
            <div
                className={styles["calorie-history-chart__goal-line"]}
                style={{ bottom: `${goalLineBottom}%` }}
            />
            <div className={styles["calorie-history-chart__bars-wrapper"]}>
                <div
                    ref={barsRef}
                    className={cx(
                        styles["calorie-history-chart__bars"],
                        isWeek && styles["calorie-history-chart__bars--week"],
                    )}
                >
                    {days.map((day, index) => (
                        <CalorieHistoryColumn
                            key={day.date}
                            day={day}
                            goal={goal}
                            maxValue={maxValue}
                            isToday={index === days.length - 1}
                            hasHistory={hasHistory}
                            showLabels={isWeek}
                        />
                    ))}
                </div>
                {!hasHistory && (
                    <p className={styles["calorie-history-chart__empty"]}>
                        {t("dietaryTab.historyEmpty")}
                    </p>
                )}
            </div>
            {!isWeek && <HorizontalScrollbar scrollRef={barsRef} />}
            <div className={styles["calorie-history-chart__footer"]}>
                <span>
                    {t("dietaryTab.historyGoalLine", {
                        goal: formatKcal(goal, locale),
                    })}
                </span>
                {range === "30" && (
                    <>
                        <span>
                            {t("dietaryTab.avgLabel", {
                                count: hasHistory
                                    ? formatKcal(average, locale)
                                    : DASH,
                            })}
                        </span>
                        <span>
                            {t("dietaryTab.daysOnGoalLabel", {
                                onGoal: hasHistory ? daysOnGoal : DASH,
                                total: days.length,
                            })}
                        </span>
                    </>
                )}
            </div>
        </>
    );
};
