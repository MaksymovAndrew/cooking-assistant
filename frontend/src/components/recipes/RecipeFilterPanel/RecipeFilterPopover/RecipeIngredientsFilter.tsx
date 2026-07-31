import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";
import { Chip } from "components/ui/Chip";
import { SearchField } from "components/ui/SearchField";

import { resolveIngredientName } from "utils/ingredientName";

interface RecipeIngredientsFilterProps {
    allIngredients: Ingredient[];
    selectedIds: number[];
    onChange: (next: number[]) => void;
}

export const RecipeIngredientsFilter: React.FC<
    RecipeIngredientsFilterProps
> = ({ allIngredients, selectedIds, onChange }) => {
    const { t } = useTranslation("recipes");
    const inputRef = useRef<HTMLInputElement>(null);

    // excludes already-selected ingredients from the search itself, same reasoning as
    // RecipePicker/IngredientPicker - so a picked ingredient can't show up again in its own results
    const selectableIngredients = useMemo(
        () =>
            allIngredients.filter(
                (ingredient) => !selectedIds.includes(ingredient.id),
            ),
        [allIngredients, selectedIds],
    );
    // same ranked search (starts-with, then contains, then category match) as the
    // ingredient picker on the recipe form - category browsing is unused here on purpose,
    // so nothing renders until a query is typed. unlike that picker, this list scrolls,
    // so every match renders instead of hard-capping at a handful
    const { query, setQuery, trimmedQuery, visibleIngredients } =
        useCategorizedIngredients({
            ingredients: selectableIngredients,
            maxSearchResults: selectableIngredients.length,
        });
    const selectedIngredients = useMemo(
        () =>
            allIngredients.filter((ingredient) =>
                selectedIds.includes(ingredient.id),
            ),
        [allIngredients, selectedIds],
    );

    const handleSelect = (ingredient: Ingredient) => {
        onChange([...selectedIds, ingredient.id]);
        setQuery("");
        inputRef.current?.focus();
    };

    const handleRemove = (id: number) => {
        onChange(selectedIds.filter((existing) => existing !== id));
    };

    return (
        <div className={styles["recipe-filter-panel__section"]}>
            <span className={styles["recipe-filter-panel__label"]}>
                {t("filterPanel.ingredientsLabel")}
            </span>
            <SearchField
                ref={inputRef}
                value={query}
                onChange={setQuery}
                placeholder={t("ingredientPicker.searchPlaceholder")}
            />
            {trimmedQuery && (
                <ul
                    className={
                        styles["recipe-filter-panel__ingredients-results"]
                    }
                >
                    {visibleIngredients.length === 0 ? (
                        <li
                            className={
                                styles["recipe-filter-panel__ingredients-empty"]
                            }
                        >
                            {t("ingredientPicker.noMatches")}
                        </li>
                    ) : (
                        visibleIngredients.map((ingredient) => (
                            <li key={ingredient.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSelect(ingredient);
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
            )}
            {selectedIngredients.length > 0 && (
                <div
                    className={styles["recipe-filter-panel__ingredients-chips"]}
                >
                    {selectedIngredients.map((ingredient) => (
                        <Chip
                            key={ingredient.id}
                            removable
                            onRemove={() => {
                                handleRemove(ingredient.id);
                            }}
                        >
                            {resolveIngredientName(ingredient)}
                        </Chip>
                    ))}
                </div>
            )}
        </div>
    );
};
