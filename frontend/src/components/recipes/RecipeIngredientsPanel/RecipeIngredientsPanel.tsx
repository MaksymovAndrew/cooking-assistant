import React from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "redux/hooks";
import { selectViewerCapabilities } from "redux/selectors/viewerSelectors";

import { useAvoidedIngredients } from "hooks/useAvoidedIngredients";
import type { IngredientAvailability } from "hooks/useIngredientAvailability";
import { useLocale } from "hooks/useLocale";

import { resolveIngredientName } from "utils/ingredientName";

import { RecipeIngredientRow } from "./RecipeIngredientRow";
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
    hasCustomCalories: boolean;
}

export const RecipeIngredientsPanel: React.FC<RecipeIngredientsPanelProps> = ({
    availability,
    haveCount,
    missingCount,
    isOwner,
    portionCount,
    onIncrement,
    onDecrement,
    hasCustomCalories,
}) => {
    const { t } = useTranslation("recipes");
    const locale = useLocale();
    const { canUsePantry } = useAppSelector(selectViewerCapabilities);
    const { isIngredientAvoided } = useAvoidedIngredients();
    const sorted = [...availability].sort((a, b) =>
        resolveIngredientName(t, a).localeCompare(
            resolveIngredientName(t, b),
            locale,
        ),
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
                    <RecipeIngredientRow
                        key={ingredient.id}
                        ingredient={ingredient}
                        canUsePantry={canUsePantry}
                        isAvoided={isIngredientAvoided(ingredient)}
                        portionCount={portionCount}
                        hasCustomCalories={hasCustomCalories}
                    />
                ))}
            </ul>

            {hasCustomCalories && (
                <p
                    className={
                        styles["recipe-ingredients-panel__custom-calories-note"]
                    }
                    role="note"
                >
                    {t("recipeDetailsPage.customCaloriesNote")}
                </p>
            )}

            {canUsePantry && missingCount > 0 && (
                <RecipeIngredientsBanner
                    isOwner={isOwner}
                    haveCount={haveCount}
                    missingCount={missingCount}
                    availability={availability}
                    portionCount={portionCount}
                />
            )}
        </div>
    );
};
