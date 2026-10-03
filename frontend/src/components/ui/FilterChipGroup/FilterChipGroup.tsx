import { cx } from "utils/cx";

import styles from "./FilterChipGroup.module.scss";

export interface FilterChipOption<T extends string | number = number> {
    id: T;
    label: string;
}

export interface FilterChipGroupProps<T extends string | number = number> {
    options: FilterChipOption<T>[];
    value: T[];
    onChange: (next: T[]) => void;
}

export const FilterChipGroup = <T extends string | number = number>({
    options,
    value,
    onChange,
}: FilterChipGroupProps<T>) => (
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
                    className={cx(
                        styles["filter-chip-group__chip"],
                        selected && styles["filter-chip-group__chip--selected"],
                    )}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);
