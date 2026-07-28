import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import type { IngredientCategoryOption } from "hooks/useIngredientCategories";

import { IngredientCategoryPanel } from "components/ingredients/IngredientCategoryPanel";
import { IngredientResultRow } from "components/ingredients/IngredientResultRow";

import styles from "./AddIngredientModal.module.scss";

interface AddIngredientDropdownProps {
    trimmedQuery: string;
    activeCategory: string | null;
    categories: IngredientCategoryOption[];
    visibleIngredients: Ingredient[];
    onSelectCategory: (category: string) => void;
    onBack: () => void;
    onSelect: (ingredient: Ingredient) => void;
}

// the search-box dropdown: category browse/back panel, plus the search/drilled-in results list
export const AddIngredientDropdown: React.FC<AddIngredientDropdownProps> = ({
    trimmedQuery,
    activeCategory,
    categories,
    visibleIngredients,
    onSelectCategory,
    onBack,
    onSelect,
}) => {
    const { t } = useTranslation("ingredients");

    return (
        <div className={styles["add-ingredient-modal__results-wrapper"]}>
            {!trimmedQuery && (
                <IngredientCategoryPanel
                    categories={categories}
                    activeCategory={activeCategory}
                    onSelectCategory={onSelectCategory}
                    onBack={onBack}
                />
            )}
            {(trimmedQuery || activeCategory) && (
                <ul className={styles["add-ingredient-modal__results"]}>
                    {visibleIngredients.length === 0 ? (
                        <li className={styles["add-ingredient-modal__empty"]}>
                            {t("addIngredientModal.noMatches")}
                        </li>
                    ) : (
                        visibleIngredients.map((ingredient) => (
                            <IngredientResultRow
                                key={ingredient.id}
                                ingredient={ingredient}
                                query={trimmedQuery}
                                onSelect={onSelect}
                            />
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};
