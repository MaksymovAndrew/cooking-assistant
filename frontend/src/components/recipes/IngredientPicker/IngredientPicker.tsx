import { Search, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";
import { usePopoverDismiss } from "hooks/usePopoverDismiss";

import { IngredientCategoryPanel } from "components/ingredients/IngredientCategoryPanel";
import { IngredientResultRow } from "components/ingredients/IngredientResultRow";

import styles from "./IngredientPicker.module.scss";

interface IngredientPickerProps {
    allIngredients: Ingredient[];
    selectedIds: number[];
    label: string;
    onToggle: (ingredient: Ingredient) => void;
}

const SEARCH_ICON_SIZE = 17;
const CLEAR_ICON_SIZE = 13;
const MAX_RESULTS = 8;

export const IngredientPicker: React.FC<IngredientPickerProps> = ({
    allIngredients,
    selectedIds,
    label,
    onToggle,
}) => {
    const { t } = useTranslation("recipes");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        query,
        setQuery,
        trimmedQuery,
        activeCategory,
        setActiveCategory,
        categories,
        visibleIngredients,
    } = useCategorizedIngredients({
        ingredients: allIngredients,
        maxSearchResults: MAX_RESULTS,
    });

    usePopoverDismiss(containerRef, isOpen, () => {
        setIsOpen(false);
    });

    const handleSelect = (ingredient: Ingredient) => {
        onToggle(ingredient);
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className={styles["ingredient-picker"]}>
            <label
                htmlFor="ingredient-picker-search"
                className={styles["ingredient-picker__label"]}
            >
                {label}
            </label>
            <div className={styles["ingredient-picker__search"]}>
                <Search size={SEARCH_ICON_SIZE} aria-hidden="true" />
                <input
                    id="ingredient-picker-search"
                    ref={inputRef}
                    type="text"
                    autoComplete="off"
                    value={query}
                    onFocus={() => {
                        setIsOpen(true);
                    }}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    placeholder={t("ingredientPicker.searchPlaceholder")}
                    className={styles["ingredient-picker__input"]}
                />
                {query && (
                    <button
                        type="button"
                        aria-label={t("ingredientPicker.clear")}
                        onClick={() => {
                            setQuery("");
                            inputRef.current?.focus();
                        }}
                    >
                        <X size={CLEAR_ICON_SIZE} aria-hidden="true" />
                    </button>
                )}
            </div>
            {isOpen && (
                <div className={styles["ingredient-picker__results-wrapper"]}>
                    {!trimmedQuery && (
                        <IngredientCategoryPanel
                            categories={categories}
                            activeCategory={activeCategory}
                            onSelectCategory={setActiveCategory}
                            onBack={() => {
                                setActiveCategory(null);
                            }}
                        />
                    )}
                    {(trimmedQuery || activeCategory) && (
                        <ul className={styles["ingredient-picker__results"]}>
                            {visibleIngredients.length === 0 ? (
                                <li
                                    className={
                                        styles["ingredient-picker__empty"]
                                    }
                                >
                                    {t("ingredientPicker.noMatches")}
                                </li>
                            ) : (
                                visibleIngredients.map((ingredient) => (
                                    <IngredientResultRow
                                        key={ingredient.id}
                                        ingredient={ingredient}
                                        query={trimmedQuery}
                                        isSelected={selectedIds.includes(
                                            ingredient.id,
                                        )}
                                        onSelect={handleSelect}
                                    />
                                ))
                            )}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
