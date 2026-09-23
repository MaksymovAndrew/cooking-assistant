import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import type { useCategorizedIngredients } from "hooks/useCategorizedIngredients";

import { IngredientCategoryPanel } from "components/ingredients/IngredientCategoryPanel";
import { IngredientResultRow } from "components/ingredients/IngredientResultRow";

import styles from "./IngredientPicker.module.scss";

type CategorizedIngredients = ReturnType<typeof useCategorizedIngredients>;

interface IngredientPickerDropdownProps {
    search: CategorizedIngredients;
    selectedIds: number[];
    onSelect: (ingredient: Ingredient) => void;
}

// with no query it browses by category; a query or an opened category lists matching ingredients
export const IngredientPickerDropdown: React.FC<
    IngredientPickerDropdownProps
> = ({ search, selectedIds, onSelect }) => {
    const { t } = useTranslation("recipes");
    const { trimmedQuery, activeCategory, visibleIngredients } = search;

    return (
        <div className={styles["ingredient-picker__results-wrapper"]}>
            {!trimmedQuery && (
                <IngredientCategoryPanel
                    categories={search.categories}
                    activeCategory={activeCategory}
                    onSelectCategory={search.setActiveCategory}
                    onBack={() => {
                        search.setActiveCategory(null);
                    }}
                />
            )}
            {(trimmedQuery || activeCategory) && (
                <ul className={styles["ingredient-picker__results"]}>
                    {visibleIngredients.length === 0 ? (
                        <li className={styles["ingredient-picker__empty"]}>
                            {t("ingredientPicker.noMatches")}
                        </li>
                    ) : (
                        visibleIngredients.map((ingredient) => (
                            <IngredientResultRow
                                key={ingredient.id}
                                ingredient={ingredient}
                                query={trimmedQuery}
                                isSelected={selectedIds.includes(ingredient.id)}
                                onSelect={onSelect}
                            />
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};
