import React from "react";
import { useTranslation } from "react-i18next";

import { CalorieProgressRing } from "components/calories/CalorieProgressRing";

import { formatKcal } from "utils/calories";
import type { CalorieTone } from "utils/computeCalorieSummary";

import styles from "./CalorieTodayCard.module.scss";

interface CalorieTodayCardProps {
    consumed: number;
    goal: number;
    remaining: number;
    over: number;
    isOverLimit: boolean;
    tone: CalorieTone;
}

const TONE_KEY: Record<CalorieTone, string> = {
    normal: "toneNormal",
    near: "toneNear",
    over: "toneOver",
};

interface LegendRow {
    toneClass: string;
    name: string;
    value: number;
}

export const CalorieTodayCard: React.FC<CalorieTodayCardProps> = ({
    consumed,
    goal,
    remaining,
    over,
    isOverLimit,
    tone,
}) => {
    const { t } = useTranslation("calories");

    const legendRows: LegendRow[] = isOverLimit
        ? [
              {
                  toneClass: styles["calorie-today-card__legend-dot--over"],
                  name: t("dietaryTab.goalLegendLabel"),
                  value: goal,
              },
              {
                  toneClass: styles["calorie-today-card__legend-dot--danger"],
                  name: t("dietaryTab.overLegendLabel"),
                  value: over,
              },
          ]
        : [
              {
                  toneClass: styles[`calorie-today-card__legend-dot--${tone}`],
                  name: t("dietaryTab.eatenLabel"),
                  value: consumed,
              },
              {
                  toneClass: styles["calorie-today-card__legend-dot--muted"],
                  name: t("dietaryTab.remainingLabel"),
                  value: remaining,
              },
          ];

    return (
        <div className={styles["calorie-today-card"]}>
            <h2 className={styles["calorie-today-card__title"]}>
                {t("dietaryTab.todayHeading")}
            </h2>
            <div className={styles["calorie-today-card__body"]}>
                <CalorieProgressRing
                    consumed={consumed}
                    goal={goal}
                    tone={tone}
                    goalLabel={t("dietaryTab.ringGoalLabel", {
                        goal: formatKcal(goal),
                    })}
                />
                <div className={styles["calorie-today-card__content"]}>
                    <span
                        className={[
                            styles["calorie-today-card__tone-pill"],
                            styles[`calorie-today-card__tone-pill--${tone}`],
                        ].join(" ")}
                    >
                        {t(`dietaryTab.${TONE_KEY[tone]}`)}
                    </span>
                    <p className={styles["calorie-today-card__summary"]}>
                        {isOverLimit
                            ? t("dietaryTab.summaryOver", {
                                  consumed: formatKcal(consumed),
                                  goal: formatKcal(goal),
                                  over: formatKcal(over),
                              })
                            : t("dietaryTab.summaryRemaining", {
                                  consumed: formatKcal(consumed),
                                  goal: formatKcal(goal),
                                  remaining: formatKcal(remaining),
                              })}
                    </p>
                    <div className={styles["calorie-today-card__legend"]}>
                        {legendRows.map((row) => (
                            <div
                                key={row.name}
                                className={
                                    styles["calorie-today-card__legend-row"]
                                }
                            >
                                <span
                                    className={[
                                        styles[
                                            "calorie-today-card__legend-dot"
                                        ],
                                        row.toneClass,
                                    ].join(" ")}
                                />
                                <span
                                    className={
                                        styles[
                                            "calorie-today-card__legend-name"
                                        ]
                                    }
                                >
                                    {row.name}
                                </span>
                                <span
                                    className={
                                        styles[
                                            "calorie-today-card__legend-value"
                                        ]
                                    }
                                >
                                    {formatKcal(row.value)}{" "}
                                    {t("dietaryTab.kcalUnit")}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
