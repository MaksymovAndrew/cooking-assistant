import React from "react";
import { useTranslation } from "react-i18next";

import { useDebouncedFieldSync } from "hooks/useDebouncedFieldSync";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";

import type { NumericRangeValue } from "utils/filters/filterDefFactories.range";

interface RecipeRangeFieldsProps {
    value: NumericRangeValue;
    onChange: (value: NumericRangeValue) => void;
}

// debounced like SearchField: instant typing feedback locally, one URL write (the caller wires
// onChange with { replace: true }) after typing settles - otherwise every keystroke on these
// free-text number fields pushed its own history entry and fired its own request
export const RecipeRangeFields: React.FC<RecipeRangeFieldsProps> = ({
    value,
    onChange,
}) => {
    const { t } = useTranslation("recipes");
    const [localMin, setLocalMin] = useDebouncedFieldSync(value.min, (min) => {
        onChange({ ...value, min });
    });
    const [localMax, setLocalMax] = useDebouncedFieldSync(value.max, (max) => {
        onChange({ ...value, max });
    });
    const bounds = [
        { label: t("filterPanel.min"), local: localMin, setLocal: setLocalMin },
        { label: t("filterPanel.max"), local: localMax, setLocal: setLocalMax },
    ];

    return (
        <div className={styles["recipe-filter-panel__time-row"]}>
            {bounds.map(({ label, local, setLocal }) => (
                <label
                    key={label}
                    className={styles["recipe-filter-panel__time-field"]}
                >
                    <span>{label}</span>
                    <input
                        type="number"
                        min="1"
                        value={local}
                        onChange={(e) => {
                            setLocal(e.target.value);
                        }}
                        className={styles["recipe-filter-panel__time-input"]}
                    />
                </label>
            ))}
        </div>
    );
};
