import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./RecipeIngredientsPanel.module.scss";

interface RecipeIngredientsHeaderProps {
    ingredientCount: number;
    portionCount: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

export const RecipeIngredientsHeader: React.FC<
    RecipeIngredientsHeaderProps
> = ({ ingredientCount, portionCount, onIncrement, onDecrement }) => {
    const { t } = useTranslation("recipes");

    return (
        <div className={styles["recipe-ingredients-panel__header"]}>
            <div>
                <div className={styles["recipe-ingredients-panel__title"]}>
                    {t("recipeDetailsPage.ingredients")}
                </div>
                <div className={styles["recipe-ingredients-panel__caption"]}>
                    {t("recipeDetailsPage.ingredientsCaption", {
                        count: ingredientCount,
                    })}
                </div>
            </div>
            <div className={styles["recipe-ingredients-panel__stepper"]}>
                <span
                    className={
                        styles["recipe-ingredients-panel__stepper-label"]
                    }
                >
                    {t("recipeDetailsPage.servings")}
                </span>
                <div
                    className={
                        styles["recipe-ingredients-panel__stepper-control"]
                    }
                >
                    <button
                        type="button"
                        aria-label={t("recipeDetailsPage.fewerPortions")}
                        onClick={onDecrement}
                    >
                        −
                    </button>
                    <span>{portionCount}</span>
                    <button
                        type="button"
                        aria-label={t("recipeDetailsPage.morePortions")}
                        onClick={onIncrement}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};
