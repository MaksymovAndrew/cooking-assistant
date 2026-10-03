import React from "react";
import { useTranslation } from "react-i18next";

import {
    type AggregatedIngredient,
    countMissingIngredients,
} from "utils/menuUtils";

import { MenuIngredientRow } from "./MenuIngredientRow";
import { MenuIngredientsActions } from "./MenuIngredientsActions";
import styles from "./MenuMissingIngredientsPanel.module.scss";

interface MenuIngredientsTrackingProps {
    ingredients: Record<number, AggregatedIngredient>;
}

export const MenuIngredientsTracking: React.FC<
    MenuIngredientsTrackingProps
> = ({ ingredients }) => {
    const { t } = useTranslation("menu");
    const entries = Object.entries(ingredients);
    const missingCount = countMissingIngredients(ingredients);

    return (
        <>
            <div className={styles["menu-missing-ingredients-panel__header"]}>
                <h2 className={styles["menu-missing-ingredients-panel__title"]}>
                    {t("menuDetailsPage.ingredientsPanelTitle")}
                </h2>
                {missingCount > 0 && (
                    <span
                        role="img"
                        aria-label={t("menuDetailsPage.missingCountLabel", {
                            count: missingCount,
                        })}
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
