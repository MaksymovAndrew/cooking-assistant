import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";
import { CLICK_OUTSIDE_SAFE_ATTR } from "hooks/useClickOutside";
import { usePopoverDismiss } from "hooks/usePopoverDismiss";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { SearchField } from "components/ui/SearchField";

import { resolveIngredientName } from "utils/ingredientName";

import { AddIngredientDropdown } from "./AddIngredientDropdown";
import styles from "./AddIngredientModal.module.scss";

interface AddIngredientModalProps {
    allIngredients: Ingredient[];
    personIngredients: PantryIngredient[];
    selectedIngredients: number[];
    onToggle: (id: number) => void;
    onSave: () => void;
    onClose: () => void;
}

const MAX_RESULTS = 8;

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
    allIngredients,
    personIngredients,
    selectedIngredients,
    onToggle,
    onSave,
    onClose,
}) => {
    const { t } = useTranslation("ingredients");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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
    const newlySelected = useMemo(
        () =>
            allIngredients.filter((ingredient) =>
                selectedIds.has(ingredient.id),
            ),
        [allIngredients, selectedIds],
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

    usePopoverDismiss(containerRef, isOpen, () => {
        setIsOpen(false);
    });

    const handleSelect = (ingredient: Ingredient) => {
        onToggle(ingredient.id);
        setQuery("");
    };

    // reopens the dropdown on typing after it's been dismissed with Escape - Escape doesn't blur the
    // input, so onFocus alone never fires again and results would stay hidden until a manual re-click
    const handleQueryChange = (value: string) => {
        setQuery(value);
        setIsOpen(true);
    };

    return (
        <BaseModal
            size="md"
            title={t("addIngredientModal.title")}
            onClose={onClose}
            // while the dropdown is open, its own Escape handler (usePopoverDismiss below) should close
            // just the dropdown - BaseModal's document-level listener is registered first (at mount) and
            // would otherwise fire first and close the whole modal on the same keypress
            closeOnEscape={!isOpen}
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        {...{ [CLICK_OUTSIDE_SAFE_ATTR]: "" }}
                    >
                        {t("addIngredientModal.cancelButton")}
                    </Button>
                    <Button
                        type="button"
                        onClick={onSave}
                        {...{ [CLICK_OUTSIDE_SAFE_ATTR]: "" }}
                    >
                        {t("addIngredientModal.saveButton")}
                    </Button>
                </>
            }
        >
            <div ref={containerRef}>
                <SearchField
                    value={query}
                    onChange={handleQueryChange}
                    onFocus={() => {
                        setIsOpen(true);
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
        </BaseModal>
    );
};
