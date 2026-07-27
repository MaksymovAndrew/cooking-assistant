import { Search } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { useCategorizedIngredients } from "hooks/useCategorizedIngredients";
import { usePopoverDismiss } from "hooks/usePopoverDismiss";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";

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

const SEARCH_ICON_SIZE = 17;
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

    return (
        <BaseModal
            size="md"
            title={t("addIngredientModal.title")}
            onClose={onClose}
        >
            <div ref={containerRef}>
                <div className={styles["add-ingredient-modal__search"]}>
                    <Search size={SEARCH_ICON_SIZE} aria-hidden="true" />
                    <input
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
                        placeholder={t("addIngredientModal.searchPlaceholder")}
                        className={styles["add-ingredient-modal__input"]}
                    />
                </div>
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

                <div className={styles["add-ingredient-modal__footer"]}>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        {t("addIngredientModal.cancelButton")}
                    </Button>
                    <Button type="button" onClick={onSave}>
                        {t("addIngredientModal.saveButton")}
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
