import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useGetCalorieIntakeQuery } from "redux/services/caloriesApi";

import { SegmentedControl } from "components/ui/SegmentedControl";

import { getLastNDaysRange } from "utils/calorieDateRange";
import {
    computeBestStreak,
    computeDailyIntake,
    computeStreak,
} from "utils/computeDailyIntake";

import { CalorieHistoryBars } from "./CalorieHistoryBars";
import styles from "./CalorieHistoryChart.module.scss";
import { CalorieHistoryStreak } from "./CalorieHistoryStreak";

interface CalorieHistoryChartProps {
    goal: number;
}

type HistoryRange = "7" | "30";

const RANGE_VALUES: Record<HistoryRange, number> = { "7": 7, "30": 30 };

export const CalorieHistoryChart: React.FC<CalorieHistoryChartProps> = ({
    goal,
}) => {
    const { t } = useTranslation("calories");
    const [range, setRange] = useState<HistoryRange>("7");
    const dayCount = RANGE_VALUES[range];
    const queryRange = useMemo(() => getLastNDaysRange(dayCount), [dayCount]);
    const { data: entries = [] } = useGetCalorieIntakeQuery(queryRange);

    const days = useMemo(
        () => computeDailyIntake(entries, dayCount),
        [entries, dayCount],
    );
    const streak = computeStreak(days, goal);
    const best = computeBestStreak(days, goal);
    const average =
        days.length > 0
            ? Math.round(
                  days.reduce((sum, day) => sum + day.consumed, 0) /
                      days.length,
              )
            : 0;
    const daysOnGoal = days.filter(
        (day) => day.consumed > 0 && day.consumed <= goal,
    ).length;

    return (
        <div className={styles["calorie-history-chart"]}>
            <div className={styles["calorie-history-chart__header"]}>
                <h3 className={styles["calorie-history-chart__heading"]}>
                    {t("dietaryTab.historyHeading")}
                </h3>
                <SegmentedControl
                    label={t("dietaryTab.historyHeading")}
                    options={[
                        { value: "7", label: t("dietaryTab.historyRange7") },
                        { value: "30", label: t("dietaryTab.historyRange30") },
                    ]}
                    value={range}
                    onChange={setRange}
                />
            </div>

            <div className={styles["calorie-history-chart__body"]}>
                <div className={styles["calorie-history-chart__chart"]}>
                    <CalorieHistoryBars
                        days={days}
                        goal={goal}
                        range={range}
                        average={average}
                        daysOnGoal={daysOnGoal}
                    />
                </div>

                <CalorieHistoryStreak streak={streak} best={best} />
            </div>
        </div>
    );
};
