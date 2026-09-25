import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { AllergenDot } from "components/ui/AllergenDot";
import { HighlightedMatch } from "components/ui/HighlightedMatch";

import { resolveIngredientName } from "utils/ingredientName";
import { unitName } from "utils/referenceLabels";

import styles from "./IngredientResultRow.module.scss";

interface IngredientResultRowProps {
    ingredient: Ingredient;
    query: string;
    isSelected?: boolean;
    onSelect: (ingredient: Ingredient) => void;
}

// a single search/browse result row, shared by the recipe ingredient picker and the pantry add-ingredient modal
export const IngredientResultRow: React.FC<IngredientResultRowProps> = ({
    ingredient,
    query,
    isSelected = false,
    onSelect,
}) => {
    const { t } = useTranslation();
    const name = resolveIngredientName(t, ingredient);

    return (
        <li>
            <button
                type="button"
                disabled={isSelected}
                onClick={() => {
                    onSelect(ingredient);
                }}
                className={[
                    styles["ingredient-result"],
                    isSelected && styles["ingredient-result--selected"],
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <span className={styles["ingredient-result__name"]}>
                    {query ? (
                        <HighlightedMatch text={name} query={query} />
                    ) : (
                        name
                    )}
                </span>
                <span className={styles["ingredient-result__unit"]}>
                    {unitName(t, ingredient.unit_name)}
                </span>
                <AllergenDot allergens={ingredient.allergens} />
            </button>
        </li>
    );
};
