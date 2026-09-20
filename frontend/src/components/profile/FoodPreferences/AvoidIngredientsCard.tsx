import { Check, Leaf } from "lucide-react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";
import { useClickOutside } from "hooks/useClickOutside";
import { useEscapeKey } from "hooks/useEscapeKey";

import { FormCard } from "components/ui/FormCard";
import { SearchField } from "components/ui/SearchField";

import { AvoidedIngredientChips } from "./AvoidedIngredientChips";
import { AvoidIngredientResults } from "./AvoidIngredientResults";
import styles from "./FoodPreferences.module.scss";

interface AvoidIngredientsCardProps {
    catalog: Ingredient[];
    ingredientIds: number[];
    avoidedIngredients: Ingredient[];
    isDisabled: boolean;
    isSavedVisible: boolean;
    onToggle: (ingredient: Ingredient) => void;
}

const TITLE_ICON_SIZE = 18;
const SAVED_ICON_SIZE = 15;
const MAX_RESULTS = 6;

export const AvoidIngredientsCard: React.FC<AvoidIngredientsCardProps> = ({
    catalog,
    ingredientIds,
    avoidedIngredients,
    isDisabled,
    isSavedVisible,
    onToggle,
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

    const handleSelect = (ingredient: Ingredient) => {
        onToggle(ingredient);
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <FormCard className={styles["food-preferences__card"]}>
            <div className={styles["food-preferences__card-head"]}>
                <Leaf size={TITLE_ICON_SIZE} aria-hidden="true" />
                <h3 className={styles["food-preferences__card-title"]}>
                    {t("ingredients.title")}
                </h3>
                <span className={styles["food-preferences__counter"]}>
                    {ingredientIds.length}
                </span>
            </div>
            <p className={styles["food-preferences__helper"]}>
                {t("ingredients.helper")}
            </p>
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
            <AvoidedIngredientChips
                ingredients={avoidedIngredients}
                isDisabled={isDisabled}
                onRemove={onToggle}
            />
            <p
                role="status"
                className={[
                    styles["food-preferences__saved"],
                    isSavedVisible &&
                        styles["food-preferences__saved--visible"],
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <Check size={SAVED_ICON_SIZE} aria-hidden="true" />
                {isSavedVisible && t("ingredients.saved")}
            </p>
        </FormCard>
    );
};
