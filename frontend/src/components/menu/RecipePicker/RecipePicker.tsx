import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { RecipeListItem } from "types/recipe";

import { useRecipePickerSearch } from "hooks/useRecipePickerSearch";

import { SearchField } from "components/ui/SearchField";

import styles from "./RecipePicker.module.scss";
import { RecipePickerResults } from "./RecipePickerResults";

interface RecipePickerProps {
    selectedIds: number[];
    label: string;
    onToggle: (recipe: RecipeListItem) => void;
}

export const RecipePicker: React.FC<RecipePickerProps> = ({
    selectedIds,
    label,
    onToggle,
}) => {
    const { t } = useTranslation("menu");
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const trimmedQuery = query.trim();
    const search = useRecipePickerSearch(trimmedQuery, selectedIds);

    const handleSelect = (recipe: RecipeListItem) => {
        onToggle(recipe);
        setQuery("");
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
                value={query}
                onChange={setQuery}
                placeholder={t("recipePicker.searchPlaceholder")}
                className={styles["recipe-picker__search"]}
            />
            {trimmedQuery && (
                <RecipePickerResults
                    {...search}
                    query={trimmedQuery}
                    onSelect={handleSelect}
                />
            )}
        </div>
    );
};
