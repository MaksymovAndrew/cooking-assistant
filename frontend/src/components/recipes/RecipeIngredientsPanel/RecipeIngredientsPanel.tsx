import { Check } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { IngredientAvailability } from "hooks/useIngredientAvailability";

import { scaleCaloriesForPortions } from "utils/calories";
import { resolveIngredientName, resolveUnit } from "utils/ingredientName";

import { RecipeIngredientsBanner } from "./RecipeIngredientsBanner";
import { RecipeIngredientsHeader } from "./RecipeIngredientsHeader";
import styles from "./RecipeIngredientsPanel.module.scss";

interface RecipeIngredientsPanelProps {
    availability: IngredientAvailability[];
    haveCount: number;
    missingCount: number;
    isOwner: boolean;
    portionCount: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

const CHECK_ICON_SIZE = 16;
const DECIMALS = 2;

const scaleQuantity = (quantity: number, scaleFactor: number) =>
    Number((quantity * scaleFactor).toFixed(DECIMALS));

export const RecipeIngredientsPanel: React.FC<RecipeIngredientsPanelProps> = ({
    availability,
    haveCount,
    missingCount,
    isOwner,
    portionCount,
    onIncrement,
    onDecrement,
}) => {
    const { t } = useTranslation("recipes");
    const sorted = [...availability].sort((a, b) =>
        resolveIngredientName(a).localeCompare(resolveIngredientName(b)),
    );

    return (
        <div className={styles["recipe-ingredients-panel"]}>
            <RecipeIngredientsHeader
                ingredientCount={availability.length}
                portionCount={portionCount}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
            />

            <ul className={styles["recipe-ingredients-panel__list"]}>
                {sorted.map((ingredient) => (
                    <li
                        key={ingredient.id}
                        className={[
                            styles["recipe-ingredients-panel__row"],
                            !ingredient.have &&
                                styles[
                                    "recipe-ingredients-panel__row--missing"
                                ],
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        {ingredient.have ? (
                            <Check
                                size={CHECK_ICON_SIZE}
                                aria-hidden="true"
                                className={
                                    styles[
                                        "recipe-ingredients-panel__have-icon"
                                    ]
                                }
                            />
                        ) : (
                            <span
                                aria-hidden="true"
                                className={
                                    styles[
                                        "recipe-ingredients-panel__missing-dot"
                                    ]
                                }
                            />
                        )}
                        <span
                            className={styles["recipe-ingredients-panel__name"]}
                        >
                            {resolveIngredientName(ingredient)}
                        </span>
                        <span
                            className={styles["recipe-ingredients-panel__qty"]}
                        >
                            {scaleQuantity(
                                ingredient.quantity_recipe_ingredients,
                                portionCount,
                            )}{" "}
                            {resolveUnit(ingredient.unit_name)}
                            {ingredient.calories_per_unit !== null && (
                                <span
                                    className={
                                        styles[
                                            "recipe-ingredients-panel__qty-calories"
                                        ]
                                    }
                                >
                                    {t("recipeDetailsPage.ingredientCalories", {
                                        count: scaleCaloriesForPortions(
                                            ingredient.quantity_recipe_ingredients *
                                                ingredient.calories_per_unit,
                                            portionCount,
                                        ),
                                    })}
                                </span>
                            )}
                        </span>
                    </li>
                ))}
            </ul>

            {missingCount > 0 && (
                <RecipeIngredientsBanner
                    isOwner={isOwner}
                    haveCount={haveCount}
                    totalCount={availability.length}
                    missingCount={missingCount}
                />
            )}
        </div>
    );
};
