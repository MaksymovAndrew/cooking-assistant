import { Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { IngredientAvailability } from "hooks/useIngredientAvailability";
import { useLocale } from "hooks/useLocale";

import { formatKcal, scaleCaloriesForPortions } from "utils/calories";
import { resolveIngredientName } from "utils/ingredientName";
import { quantityWithUnit } from "utils/referenceLabels";

import styles from "./RecipeIngredientsPanel.module.scss";

interface RecipeIngredientRowProps {
    ingredient: IngredientAvailability;
    canUsePantry: boolean;
    isAvoided: boolean;
    portionCount: number;
    hasCustomCalories: boolean;
}

const CHECK_ICON_SIZE = 16;

export const RecipeIngredientRow: React.FC<RecipeIngredientRowProps> = ({
    ingredient,
    canUsePantry,
    isAvoided,
    portionCount,
    hasCustomCalories,
}) => {
    const { t } = useTranslation("recipes");
    const locale = useLocale();
    const quantity = ingredient.quantity_recipe_ingredients * portionCount;
    const calories =
        hasCustomCalories || ingredient.calories_per_unit === null
            ? null
            : scaleCaloriesForPortions(
                  ingredient.quantity_recipe_ingredients *
                      ingredient.calories_per_unit,
                  portionCount,
              );

    return (
        <li
            className={[
                styles["recipe-ingredients-panel__row"],
                canUsePantry &&
                    !ingredient.have &&
                    styles["recipe-ingredients-panel__row--missing"],
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {canUsePantry &&
                (ingredient.have ? (
                    <Check
                        size={CHECK_ICON_SIZE}
                        aria-hidden="true"
                        className={
                            styles["recipe-ingredients-panel__have-icon"]
                        }
                    />
                ) : (
                    <span
                        aria-hidden="true"
                        className={
                            styles["recipe-ingredients-panel__missing-dot"]
                        }
                    />
                ))}
            <span className={styles["recipe-ingredients-panel__name"]}>
                {isAvoided && (
                    <span
                        className={
                            styles["recipe-ingredients-panel__avoided-dot"]
                        }
                    >
                        <span
                            className={
                                styles["recipe-ingredients-panel__sr-only"]
                            }
                        >
                            {t("dietPreferences:avoidedRow")}
                        </span>
                    </span>
                )}
                {resolveIngredientName(t, ingredient)}
            </span>
            <span className={styles["recipe-ingredients-panel__qty"]}>
                {quantityWithUnit(t, locale, quantity, ingredient.unit_name)}
                {calories !== null && (
                    <span
                        className={
                            styles["recipe-ingredients-panel__qty-calories"]
                        }
                    >
                        {t("recipeDetailsPage.ingredientCalories", {
                            count: formatKcal(calories, locale),
                        })}
                    </span>
                )}
            </span>
        </li>
    );
};
