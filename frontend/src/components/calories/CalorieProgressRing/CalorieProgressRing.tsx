import React from "react";

import { ProgressRing } from "components/ui/ProgressRing";

import { calorieRingFraction, formatKcal } from "utils/calories";
import type { CalorieTone } from "utils/computeCalorieSummary";

import styles from "./CalorieProgressRing.module.scss";

interface CalorieProgressRingProps {
    consumed: number;
    goal: number;
    tone: CalorieTone;
    goalLabel: string;
}

const RING_SIZE = 140;
const RING_THICKNESS = 22;
const RING_INSET = 7;

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
}) => (
    <div
        data-testid="calorie-progress-ring"
        className={[styles["calorie-progress-ring"], TONE_CLASS[tone]].join(
            " ",
        )}
    >
        <ProgressRing
            fraction={calorieRingFraction(consumed, goal)}
            size={RING_SIZE}
            thickness={RING_THICKNESS}
            inset={RING_INSET}
            className={styles["calorie-progress-ring__ring"]}
        >
            <span className={styles["calorie-progress-ring__value"]}>
                {formatKcal(consumed)}
            </span>
            <span className={styles["calorie-progress-ring__label"]}>
                {goalLabel}
            </span>
        </ProgressRing>
    </div>
);
