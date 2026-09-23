import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { RecipeListItem } from "types/recipe";

import { useClientFilters } from "hooks/useClientFilters";

import { SearchField } from "components/ui/SearchField";

import type { RecipePickerFilterState } from "utils/filters/recipePickerFilterDefs";
import { RECIPE_PICKER_FILTER_DEFS } from "utils/filters/recipePickerFilterDefs";

import styles from "./RecipePicker.module.scss";
import { RecipePickerResults } from "./RecipePickerResults";

interface RecipePickerProps {
    allRecipes: RecipeListItem[];
    selectedIds: number[];
    label: string;
    onToggle: (recipe: RecipeListItem) => void;
}

const MAX_RESULTS = 8;

export const RecipePicker: React.FC<RecipePickerProps> = ({
    allRecipes,
    selectedIds,
    label,
    onToggle,
}) => {
    const { t } = useTranslation("menu");
    const inputRef = useRef<HTMLInputElement>(null);
    const {
        values: filters,
        setValue,
        visibleItems,
    } = useClientFilters<RecipeListItem, RecipePickerFilterState>(
        RECIPE_PICKER_FILTER_DEFS,
        allRecipes,
    );
    const trimmedQuery = filters.query.trim();

    const matches = useMemo(
        () =>
            trimmedQuery
                ? visibleItems
                      .filter((recipe) => !selectedIds.includes(recipe.id))
                      .slice(0, MAX_RESULTS)
                : [],
        [trimmedQuery, visibleItems, selectedIds],
    );

    const handleSelect = (recipe: RecipeListItem) => {
        onToggle(recipe);
        setValue("query", "");
        inputRef.current?.focus();
    };

    return (
        <div className={styles["recipe-picker"]}>
            <label
                htmlFor="recipe-picker-search"
                className={styles["recipe-picker__label"]}
            >
                {label}
            </label>
            <SearchField
                ref={inputRef}
                id="recipe-picker-search"
                value={filters.query}
                onChange={(value) => {
                    setValue("query", value);
                }}
                placeholder={t("recipePicker.searchPlaceholder")}
                className={styles["recipe-picker__search"]}
            />
            {trimmedQuery && (
                <RecipePickerResults
                    matches={matches}
                    query={trimmedQuery}
                    onSelect={handleSelect}
                />
            )}
        </div>
    );
};
