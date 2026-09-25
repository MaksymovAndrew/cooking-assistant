import { Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import { resolveIngredientName } from "utils/ingredientName";
import type { AggregatedIngredient } from "utils/menuUtils";
import { roundQuantity } from "utils/roundQuantity";

import styles from "./MenuMissingIngredientsPanel.module.scss";

interface MenuIngredientRowProps {
    ingredient: AggregatedIngredient;
}

const CHECK_ICON_SIZE = 13;

export const MenuIngredientRow: React.FC<MenuIngredientRowProps> = ({
    ingredient: { slug, name, quantity, missingQuantity, unit, sufficient },
}) => {
    const { t } = useTranslation("menu");

    return (
        <li
            className={[
                styles["menu-missing-ingredients-panel__row"],
                !sufficient &&
                    styles["menu-missing-ingredients-panel__row--missing"],
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {sufficient ? (
                <Check
                    size={CHECK_ICON_SIZE}
                    aria-label={t("menuDetailsPage.haveEnough")}
                    className={styles["menu-missing-ingredients-panel__check"]}
                />
            ) : (
                <span
                    aria-hidden="true"
                    className={
                        styles["menu-missing-ingredients-panel__missing-dot"]
                    }
                />
            )}
            <span className={styles["menu-missing-ingredients-panel__name"]}>
                {resolveIngredientName(t, { slug, name })}
            </span>
            <span className={styles["menu-missing-ingredients-panel__qty"]}>
                {roundQuantity(sufficient ? quantity : missingQuantity)} {unit}
            </span>
        </li>
    );
};
