import React from "react";

import styles from "./ToggleSwitch.module.scss";

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
}) => {
    const classNames = [
        styles["toggle-switch"],
        checked && styles["toggle-switch--on"],
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => {
                onChange(!checked);
            }}
            className={classNames}
        >
            <span className={styles["toggle-switch__knob"]} />
        </button>
    );
};
