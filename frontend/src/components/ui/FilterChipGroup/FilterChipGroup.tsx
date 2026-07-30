import React from "react";

import styles from "./FilterChipGroup.module.scss";

export interface FilterChipOption {
    id: number;
    label: string;
}

export interface FilterChipGroupProps {
    options: FilterChipOption[];
    value: number[];
    onChange: (next: number[]) => void;
}

// multi-select pill row shared by every id-list filter (recipe types, menu categories, ...);
// owns the add/remove-from-array logic so no popover has to repeat it
export const FilterChipGroup: React.FC<FilterChipGroupProps> = ({
    options,
    value,
    onChange,
}) => (
    <div className={styles["filter-chip-group"]}>
        {options.map((option) => {
            const selected = value.includes(option.id);

            return (
                <button
                    key={option.id}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    aria-label={option.label}
                    onClick={() => {
                        onChange(
                            selected
                                ? value.filter((id) => id !== option.id)
                                : [...value, option.id],
                        );
                    }}
                    className={[
                        styles["filter-chip-group__chip"],
                        selected && styles["filter-chip-group__chip--selected"],
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);
