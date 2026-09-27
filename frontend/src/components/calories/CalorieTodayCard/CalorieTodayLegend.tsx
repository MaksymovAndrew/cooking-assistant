import React from "react";
import { useTranslation } from "react-i18next";

import { useLocale } from "hooks/useLocale";

import { formatKcal } from "utils/calories";
import type { CalorieTone } from "utils/computeCalorieSummary";

import styles from "./CalorieTodayCard.module.scss";

interface CalorieTodayLegendProps {
    consumed: number;
    goal: number;
    remaining: number;
    over: number;
    isOverLimit: boolean;
    tone: CalorieTone;
}

interface LegendRow {
    toneClass: string;
    name: string;
    value: number;
}

export const CalorieTodayLegend: React.FC<CalorieTodayLegendProps> = ({
    consumed,
    goal,
    remaining,
    over,
    isOverLimit,
    tone,
}) => {
    const { t } = useTranslation("calories");
    const locale = useLocale();

    // over the limit the ring reads as goal + overshoot, below it as eaten + left
    const rows: LegendRow[] = isOverLimit
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
        <div className={styles["calorie-today-card__legend"]}>
            {rows.map((row) => (
                <div
                    key={row.name}
                    className={styles["calorie-today-card__legend-row"]}
                >
                    <span
                        className={[
                            styles["calorie-today-card__legend-dot"],
                            row.toneClass,
                        ].join(" ")}
                    />
                    <span className={styles["calorie-today-card__legend-name"]}>
                        {row.name}
                    </span>
                    <span
                        className={styles["calorie-today-card__legend-value"]}
                    >
                        {formatKcal(row.value, locale)}{" "}
                        {t("dietaryTab.kcalUnit")}
                    </span>
                </div>
            ))}
        </div>
    );
};
