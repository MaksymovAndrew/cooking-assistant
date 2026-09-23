import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";

import { resolveIngredientName } from "utils/ingredientName";

interface IngredientFilterResultsProps {
    results: Ingredient[];
    onSelect: (ingredient: Ingredient) => void;
}

export const IngredientFilterResults: React.FC<
    IngredientFilterResultsProps
> = ({ results, onSelect }) => {
    const { t } = useTranslation("recipes");

    return (
        <ul className={styles["recipe-filter-panel__ingredients-results"]}>
            {results.length === 0 ? (
                <li
                    className={styles["recipe-filter-panel__ingredients-empty"]}
                >
                    {t("ingredientPicker.noMatches")}
                </li>
            ) : (
                results.map((ingredient) => (
                    <li key={ingredient.id}>
                        <button
                            type="button"
                            onClick={() => {
                                onSelect(ingredient);
                            }}
                            className={
                                styles[
                                    "recipe-filter-panel__ingredients-result"
                                ]
                            }
                        >
                            {resolveIngredientName(ingredient)}
                        </button>
                    </li>
                ))
            )}
        </ul>
    );
};
