import React from "react";
import { useTranslation } from "react-i18next";

import type { AggregatedIngredient } from "utils/menuUtils";

import { MenuIngredientRow } from "./MenuIngredientRow";
import { MenuIngredientsActions } from "./MenuIngredientsActions";
import styles from "./MenuMissingIngredientsPanel.module.scss";

interface MenuIngredientsTrackingProps {
    ingredients: Record<number, AggregatedIngredient>;
}

// the pantry-aware section of MenuMissingIngredientsPanel - split out to keep the panel under
// the components/ max-lines cap, and only rendered for a viewer with a pantry to check against
export const MenuIngredientsTracking: React.FC<
    MenuIngredientsTrackingProps
> = ({ ingredients }) => {
    const { t } = useTranslation("menu");
    const entries = Object.entries(ingredients);
    const missingCount = entries.filter(
        ([, ingredient]) => !ingredient.sufficient,
    ).length;

    return (
        <>
            <div className={styles["menu-missing-ingredients-panel__header"]}>
                <span
                    className={styles["menu-missing-ingredients-panel__title"]}
                >
                    {t("menuDetailsPage.ingredientsPanelTitle")}
                </span>
                {missingCount > 0 && (
                    <span
                        className={
                            styles["menu-missing-ingredients-panel__badge"]
                        }
                    >
                        {missingCount}
                    </span>
                )}
            </div>
            {entries.length === 0 ? (
                <p className={styles["menu-missing-ingredients-panel__empty"]}>
                    {t("menuDetailsPage.noMissingIngredients")}
                </p>
            ) : (
                <>
                    <ul
                        className={
                            styles["menu-missing-ingredients-panel__list"]
                        }
                    >
                        {entries.map(([id, ingredient]) => (
                            <MenuIngredientRow
                                key={id}
                                ingredient={ingredient}
                            />
                        ))}
                    </ul>
                    <MenuIngredientsActions ingredients={ingredients} />
                </>
            )}
        </>
    );
};
