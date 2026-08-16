import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { profileDietaryPath } from "constants/routes";

import { calorieRingFraction, formatKcal } from "utils/calories";
import {
    calorieToneFor,
    computeCalorieSummary,
} from "utils/computeCalorieSummary";

import styles from "./KcalStatCard.module.scss";

interface KcalStatCardProps {
    consumed: number;
    goal: number | null;
    // "consumed" (default) reads today's total against tone-specific messaging; "remaining"
    // reads what's left of the goal instead, with a fixed label - the ring and tone/colour stay
    // the same either way since both frame the same underlying progress
    variant?: "consumed" | "remaining";
}

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PERCENT_MULTIPLIER = 100;

export const KcalStatCard: React.FC<KcalStatCardProps> = ({
    consumed,
    goal,
    variant = "consumed",
}) => {
    const { t } = useTranslation("calories");

    if (goal === null) {
        return (
            <Link
                to={profileDietaryPath()}
                className={styles["kcal-stat-card--empty"]}
            >
                <span className={styles["kcal-stat-card__empty-label"]}>
                    {t("homeTile.emptyLabel")}
                </span>
                <span className={styles["kcal-stat-card__empty-cta"]}>
                    {t("homeTile.emptyCta")}
                </span>
            </Link>
        );
    }

    const summary = computeCalorieSummary([{ calories: consumed }], goal);
    const tone = calorieToneFor(summary);
    const fraction = calorieRingFraction(consumed, goal);
    const dashArray = `${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    const percent = Math.round(fraction * PERCENT_MULTIPLIER);
    const LABEL_BY_TONE: Record<typeof tone, string> = {
        normal: t("homeTile.label"),
        near: t("homeTile.labelWithPercent", { percent }),
        over: t("homeTile.labelOver"),
    };
    const value =
        variant === "remaining" ? Math.max(goal - consumed, 0) : consumed;
    const label =
        variant === "remaining"
            ? t("homeTile.remainingLabel")
            : LABEL_BY_TONE[tone];

    const cardClass = [
        styles["kcal-stat-card"],
        tone !== "normal" && styles[`kcal-stat-card--${tone}`],
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div data-testid="kcal-stat-card" className={cardClass}>
            <span className={styles["kcal-stat-card__ring"]} aria-hidden="true">
                <svg viewBox="0 0 34 34">
                    <circle
                        className={styles["kcal-stat-card__ring-track"]}
                        cx="17"
                        cy="17"
                        r={RADIUS}
                        fill="none"
                    />
                    <circle
                        className={styles["kcal-stat-card__ring-arc"]}
                        cx="17"
                        cy="17"
                        r={RADIUS}
                        fill="none"
                        strokeDasharray={dashArray}
                        transform="rotate(-90 17 17)"
                    />
                </svg>
            </span>
            <span>
                <span className={styles["kcal-stat-card__value"]}>
                    {formatKcal(value)}
                </span>
                <span className={styles["kcal-stat-card__label"]}>{label}</span>
            </span>
        </div>
    );
};
