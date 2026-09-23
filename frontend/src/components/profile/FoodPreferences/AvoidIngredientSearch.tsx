import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";
import { useClickOutside } from "hooks/useClickOutside";
import { useEscapeKey } from "hooks/useEscapeKey";

import { SearchField } from "components/ui/SearchField";

import { AvoidIngredientResults } from "./AvoidIngredientResults";
import styles from "./FoodPreferences.module.scss";

interface AvoidIngredientSearchProps {
    catalog: Ingredient[];
    ingredientIds: number[];
    isDisabled: boolean;
    onSelect: (ingredient: Ingredient) => void;
}

const MAX_RESULTS = 6;

export const AvoidIngredientSearch: React.FC<AvoidIngredientSearchProps> = ({
    catalog,
    ingredientIds,
    isDisabled,
    onSelect,
}) => {
    const { t } = useTranslation("dietPreferences");
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { query, setQuery, trimmedQuery, visibleIngredients } =
        useCategorizedIngredients({
            ingredients: catalog,
            maxSearchResults: MAX_RESULTS,
        });
    const hasQuery = trimmedQuery !== "";

    const closeResults = () => {
        setQuery("");
    };

    useClickOutside(searchRef, closeResults, hasQuery);
    useEscapeKey(closeResults, hasQuery);

    // back to an empty field with the cursor in it, ready for the next ingredient
    const handleSelect = (ingredient: Ingredient) => {
        onSelect(ingredient);
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <div ref={searchRef} className={styles["food-preferences__search"]}>
            <SearchField
                ref={inputRef}
                value={query}
                onChange={setQuery}
                placeholder={t("ingredients.searchPlaceholder")}
            />
            {hasQuery && (
                <AvoidIngredientResults
                    query={trimmedQuery}
                    results={visibleIngredients}
                    ingredientIds={ingredientIds}
                    isDisabled={isDisabled}
                    onSelect={handleSelect}
                />
            )}
        </div>
    );
};
