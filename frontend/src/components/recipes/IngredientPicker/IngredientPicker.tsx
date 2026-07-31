import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";
import { usePopoverDismiss } from "hooks/usePopoverDismiss";

import { IngredientCategoryPanel } from "components/ingredients/IngredientCategoryPanel";
import { IngredientResultRow } from "components/ingredients/IngredientResultRow";
import { SearchField } from "components/ui/SearchField";

import styles from "./IngredientPicker.module.scss";

interface IngredientPickerProps {
    allIngredients: Ingredient[];
    selectedIds: number[];
    label: string;
    onToggle: (ingredient: Ingredient) => void;
}

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

    // reopens the dropdown on typing after it's been dismissed with Escape - Escape doesn't blur the
    // input, so onFocus alone never fires again and results would stay hidden until a manual re-click
    const handleQueryChange = (value: string) => {
        setQuery(value);
        setIsOpen(true);
    };

    return (
        <div ref={containerRef} className={styles["ingredient-picker"]}>
            <label
                htmlFor="ingredient-picker-search"
                className={styles["ingredient-picker__label"]}
            >
                {label}
            </label>
            <SearchField
                ref={inputRef}
                id="ingredient-picker-search"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => {
                    setIsOpen(true);
                }}
                placeholder={t("ingredientPicker.searchPlaceholder")}
                className={styles["ingredient-picker__search"]}
            />
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
