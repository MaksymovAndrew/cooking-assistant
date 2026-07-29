import React from "react";

import styles from "./SegmentedControl.module.scss";

export interface SegmentedOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedControlProps<T extends string> {
    options: readonly SegmentedOption<T>[];
    value: T | null;
    onChange: (value: T) => void;
    label: string;
}

export const SegmentedControl = <T extends string>({
    options,
    value,
    onChange,
    label,
}: SegmentedControlProps<T>): React.ReactElement => (
    <div
        role="radiogroup"
        aria-label={label}
        className={styles["segmented-control"]}
    >
        {options.map((option) => {
            const isActive = option.value === value;
            const classNames = [
                styles["segmented-control__segment"],
                isActive && styles["segmented-control__segment--active"],
            ]
                .filter(Boolean)
                .join(" ");

            return (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => {
                        onChange(option.value);
                    }}
                    className={classNames}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);
