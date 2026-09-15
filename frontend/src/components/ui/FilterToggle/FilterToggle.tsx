import React from "react";

import { ToggleSwitch } from "components/ui/ToggleSwitch";

import styles from "./FilterToggle.module.scss";

type FilterToggleIcon = React.ComponentType<{
    size?: number;
    "aria-hidden"?: boolean | "true" | "false";
}>;

interface FilterToggleProps {
    icon: FilterToggleIcon;
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

const ICON_SIZE = 20;

// a labelled on/off filter row inside a filter popover (pantry, favourites)
export const FilterToggle: React.FC<FilterToggleProps> = ({
    icon: Icon,
    label,
    checked,
    onChange,
}) => (
    <div className={styles["filter-toggle"]}>
        <span className={styles["filter-toggle__label"]}>
            <Icon size={ICON_SIZE} aria-hidden="true" />
            {label}
        </span>
        <ToggleSwitch label={label} checked={checked} onChange={onChange} />
    </div>
);
