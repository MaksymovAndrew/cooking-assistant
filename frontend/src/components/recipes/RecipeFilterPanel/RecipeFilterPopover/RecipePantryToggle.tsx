import React from "react";
import { useTranslation } from "react-i18next";

import { BasketMark } from "components/icons";
import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";
import { ToggleSwitch } from "components/ui/ToggleSwitch";

interface RecipePantryToggleProps {
    checked: boolean;
    onChange: (value: boolean) => void;
}

const PANTRY_ICON_SIZE = 20;

export const RecipePantryToggle: React.FC<RecipePantryToggleProps> = ({
    checked,
    onChange,
}) => {
    const { t } = useTranslation("recipes");
    const label = t("filterPanel.inPantryLabel");

    return (
        <div className={styles["recipe-filter-panel__section"]}>
            <div className={styles["recipe-filter-panel__pantry-row"]}>
                <span className={styles["recipe-filter-panel__pantry-label"]}>
                    <BasketMark size={PANTRY_ICON_SIZE} aria-hidden="true" />
                    {label}
                </span>
                <ToggleSwitch
                    label={label}
                    checked={checked}
                    onChange={onChange}
                />
            </div>
        </div>
    );
};
