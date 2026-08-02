import React from "react";

import { calorieRingFraction, formatKcal } from "utils/calories";
import type { CalorieTone } from "utils/computeCalorieSummary";

import styles from "./CalorieProgressRing.module.scss";

interface CalorieProgressRingProps {
    consumed: number;
    goal: number;
    tone: CalorieTone;
    goalLabel: string;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TONE_CLASS: Record<CalorieTone, string> = {
    normal: styles["calorie-progress-ring--normal"],
    near: styles["calorie-progress-ring--near"],
    over: styles["calorie-progress-ring--over"],
};

export const CalorieProgressRing: React.FC<CalorieProgressRingProps> = ({
    consumed,
    goal,
    tone,
    goalLabel,
}) => {
    const fraction = calorieRingFraction(consumed, goal);
    const dashArray = `${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`;

    return (
        <div
            data-testid="calorie-progress-ring"
            className={[styles["calorie-progress-ring"], TONE_CLASS[tone]].join(
                " ",
            )}
        >
            <svg
                viewBox="0 0 140 140"
                className={styles["calorie-progress-ring__svg"]}
                aria-hidden="true"
            >
                <circle
                    className={styles["calorie-progress-ring__track"]}
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    fill="none"
                />
                <circle
                    data-testid="calorie-progress-ring-arc"
                    className={styles["calorie-progress-ring__arc"]}
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    fill="none"
                    strokeDasharray={dashArray}
                    transform="rotate(-90 70 70)"
                />
            </svg>
            <div className={styles["calorie-progress-ring__center"]}>
                <span className={styles["calorie-progress-ring__value"]}>
                    {formatKcal(consumed)}
                </span>
                <span className={styles["calorie-progress-ring__label"]}>
                    {goalLabel}
                </span>
            </div>
        </div>
    );
};
