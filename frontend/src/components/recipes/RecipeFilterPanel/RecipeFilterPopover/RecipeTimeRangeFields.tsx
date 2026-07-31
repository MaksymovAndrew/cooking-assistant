import React from "react";
import { useTranslation } from "react-i18next";

import { useDebouncedFieldSync } from "hooks/useDebouncedFieldSync";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";

interface RecipeTimeRangeFieldsProps {
    minCookingTime: string;
    maxCookingTime: string;
    setMinCookingTime: (time: string) => void;
    setMaxCookingTime: (time: string) => void;
}

// debounced like SearchField: instant typing feedback locally, one URL write (via
// setMin/MaxCookingTime, which the caller wires with { replace: true }) after typing settles -
// otherwise every keystroke on these free-text number fields pushed its own history entry and
// fired its own request
export const RecipeTimeRangeFields: React.FC<RecipeTimeRangeFieldsProps> = ({
    minCookingTime,
    maxCookingTime,
    setMinCookingTime,
    setMaxCookingTime,
}) => {
    const { t } = useTranslation("recipes");
    const [localMin, setLocalMin] = useDebouncedFieldSync(
        minCookingTime,
        setMinCookingTime,
    );
    const [localMax, setLocalMax] = useDebouncedFieldSync(
        maxCookingTime,
        setMaxCookingTime,
    );

    return (
        <div className={styles["recipe-filter-panel__time-row"]}>
            <label className={styles["recipe-filter-panel__time-field"]}>
                <span>{t("filterPanel.min")}</span>
                <input
                    type="number"
                    min="0"
                    value={localMin}
                    onChange={(e) => {
                        setLocalMin(e.target.value);
                    }}
                    className={styles["recipe-filter-panel__time-input"]}
                />
            </label>
            <label className={styles["recipe-filter-panel__time-field"]}>
                <span>{t("filterPanel.max")}</span>
                <input
                    type="number"
                    min="1"
                    value={localMax}
                    onChange={(e) => {
                        setLocalMax(e.target.value);
                    }}
                    className={styles["recipe-filter-panel__time-input"]}
                />
            </label>
        </div>
    );
};
