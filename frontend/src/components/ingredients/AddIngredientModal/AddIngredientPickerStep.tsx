import React, { type RefObject, useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";

import { Chip } from "components/ui/Chip";
import { SearchField } from "components/ui/SearchField";

import { resolveIngredientName } from "utils/ingredientName";

import { AddIngredientDropdown } from "./AddIngredientDropdown";
import styles from "./AddIngredientModal.module.scss";

interface AddIngredientPickerStepProps {
    containerRef: RefObject<HTMLDivElement | null>;
    allIngredients: Ingredient[];
    personIngredients: PantryIngredient[];
    selectedIngredients: number[];
    newlySelected: Ingredient[];
    onToggle: (id: number) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const MAX_RESULTS = 8;

// the "pick ingredients" step of AddIngredientModal - search/category browsing plus the
// removable chips for what's selected so far, split out to stay under the file's max-lines cap
export const AddIngredientPickerStep: React.FC<
    AddIngredientPickerStepProps
> = ({
    containerRef,
    allIngredients,
    personIngredients,
    selectedIngredients,
    newlySelected,
    onToggle,
    isOpen,
    onOpenChange,
}) => {
    const { t } = useTranslation("ingredients");

    const ownedIds = useMemo(
        () => new Set(personIngredients.map((item) => item.id)),
        [personIngredients],
    );
    const selectedIds = useMemo(
        () => new Set(selectedIngredients),
        [selectedIngredients],
    );
    const availableIngredients = useMemo(
        () =>
            allIngredients.filter(
                (ingredient) =>
                    !ownedIds.has(ingredient.id) &&
                    !selectedIds.has(ingredient.id),
            ),
        [allIngredients, ownedIds, selectedIds],
    );
    const {
        query,
        setQuery,
        trimmedQuery,
        activeCategory,
        setActiveCategory,
        categories,
        visibleIngredients,
    } = useCategorizedIngredients({
        ingredients: availableIngredients,
        maxSearchResults: MAX_RESULTS,
    });

    const handleSelect = (ingredient: Ingredient) => {
        onToggle(ingredient.id);
        setQuery("");
    };

    // reopens the dropdown on typing after it's been dismissed with Escape - Escape doesn't blur the
    // input, so onFocus alone never fires again and results would stay hidden until a manual re-click
    const handleQueryChange = (value: string) => {
        setQuery(value);
        onOpenChange(true);
    };

    return (
        <div ref={containerRef}>
            <SearchField
                value={query}
                onChange={handleQueryChange}
                onFocus={() => {
                    onOpenChange(true);
                }}
                placeholder={t("addIngredientModal.searchPlaceholder")}
                className={styles["add-ingredient-modal__search"]}
            />
            {isOpen && (
                <AddIngredientDropdown
                    trimmedQuery={trimmedQuery}
                    activeCategory={activeCategory}
                    categories={categories}
                    visibleIngredients={visibleIngredients}
                    onSelectCategory={setActiveCategory}
                    onBack={() => {
                        setActiveCategory(null);
                    }}
                    onSelect={handleSelect}
                />
            )}

            {newlySelected.length > 0 && (
                <div className={styles["add-ingredient-modal__selected"]}>
                    {newlySelected.map((ingredient) => (
                        <Chip
                            key={ingredient.id}
                            removable
                            onRemove={() => {
                                onToggle(ingredient.id);
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
