import { Search } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";

import { resolveIngredientName } from "utils/ingredientName";

import styles from "./AddIngredientModal.module.scss";
import { AddIngredientResult } from "./AddIngredientResult";

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
    const [query, setQuery] = useState("");
    const trimmedQuery = query.trim();

    const availableIngredients = allIngredients.filter(
        (ingredient) =>
            !personIngredients.some((item) => item.id === ingredient.id),
    );
    const newlySelected = availableIngredients.filter((ingredient) =>
        selectedIngredients.includes(ingredient.id),
    );
    const matches = trimmedQuery
        ? availableIngredients
              .filter(
                  (ingredient) =>
                      !selectedIngredients.includes(ingredient.id) &&
                      resolveIngredientName(ingredient)
                          .toLowerCase()
                          .includes(trimmedQuery.toLowerCase()),
              )
              .slice(0, MAX_RESULTS)
        : [];

    return (
        <BaseModal
            size="md"
            title={t("addIngredientModal.title")}
            onClose={onClose}
        >
            <div className={styles["add-ingredient-modal__search"]}>
                <Search size={SEARCH_ICON_SIZE} aria-hidden="true" />
                <input
                    type="text"
                    autoComplete="off"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                    }}
                    placeholder={t("addIngredientModal.searchPlaceholder")}
                    className={styles["add-ingredient-modal__input"]}
                />
            </div>
            {trimmedQuery && (
                <div
                    className={styles["add-ingredient-modal__results-wrapper"]}
                >
                    <ul className={styles["add-ingredient-modal__results"]}>
                        {matches.length === 0 ? (
                            <li
                                className={
                                    styles["add-ingredient-modal__empty"]
                                }
                            >
                                {t("addIngredientModal.noMatches")}
                            </li>
                        ) : (
                            matches.map((ingredient) => (
                                <AddIngredientResult
                                    key={ingredient.id}
                                    ingredient={ingredient}
                                    query={trimmedQuery}
                                    onSelect={(id) => {
                                        onToggle(id);
                                        setQuery("");
                                    }}
                                />
                            ))
                        )}
                    </ul>
                </div>
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
        </BaseModal>
    );
};
