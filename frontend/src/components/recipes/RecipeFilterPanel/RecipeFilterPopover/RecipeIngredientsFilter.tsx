import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";

import styles from "components/recipes/RecipeFilterPanel/RecipeFilterPanel.module.scss";
import { Chip } from "components/ui/Chip";
import { SearchField } from "components/ui/SearchField";

import { resolveIngredientName } from "utils/ingredientName";

import { FilterSection } from "./FilterSection";
import { IngredientFilterResults } from "./IngredientFilterResults";

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

    const selectableIngredients = useMemo(
        () =>
            allIngredients.filter(
                (ingredient) => !selectedIds.includes(ingredient.id),
            ),
        [allIngredients, selectedIds],
    );
    // uncapped: unlike the recipe form's picker, this list scrolls
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
        <FilterSection label={t("filterPanel.ingredientsLabel")}>
            <SearchField
                ref={inputRef}
                value={query}
                onChange={setQuery}
                placeholder={t("ingredientPicker.searchPlaceholder")}
            />
            {trimmedQuery && (
                <IngredientFilterResults
                    results={visibleIngredients}
                    onSelect={handleSelect}
                />
            )}
            {selectedIngredients.length > 0 && (
                <div
                    className={styles["recipe-filter-panel__ingredients-chips"]}
                >
                    {selectedIngredients.map((ingredient) => {
                        const name = resolveIngredientName(t, ingredient);

                        return (
                            <Chip
                                key={ingredient.id}
                                removable
                                name={name}
                                onRemove={() => {
                                    handleRemove(ingredient.id);
                                }}
                            >
                                {name}
                            </Chip>
                        );
                    })}
                </div>
            )}
        </FilterSection>
    );
};
