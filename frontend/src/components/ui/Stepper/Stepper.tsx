import { Minus, Plus } from "lucide-react";
import React from "react";

import styles from "./Stepper.module.scss";

interface StepperProps {
    value: number;
    onChange: (value: number) => void;
    decrementLabel: string;
    incrementLabel: string;
    min?: number;
    max?: number;
    step?: number;
}

const DEFAULT_STEP = 1;
const ICON_SIZE = 16;

export const Stepper: React.FC<StepperProps> = ({
    value,
    onChange,
    decrementLabel,
    incrementLabel,
    min = -Infinity,
    max = Infinity,
    step = DEFAULT_STEP,
}) => (
    <div className={styles.stepper}>
        <button
            type="button"
            onClick={() => {
                onChange(Math.max(min, value - step));
            }}
            disabled={value <= min}
            aria-label={decrementLabel}
            className={styles.stepper__button}
        >
            <Minus size={ICON_SIZE} aria-hidden="true" />
        </button>
        <span className={styles.stepper__value}>{value}</span>
        <button
            type="button"
            onClick={() => {
                onChange(Math.min(max, value + step));
            }}
            disabled={value >= max}
            aria-label={incrementLabel}
            className={styles.stepper__button}
        >
            <Plus size={ICON_SIZE} aria-hidden="true" />
        </button>
    </div>
);
