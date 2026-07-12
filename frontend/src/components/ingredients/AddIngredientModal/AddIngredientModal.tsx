import { Search } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { BaseModal } from "components/modals/BaseModal";
import { AllergenDot } from "components/ui/AllergenDot";
import { Button } from "components/ui/Button";
import { Chip } from "components/ui/Chip";
import { HighlightedMatch } from "components/ui/HighlightedMatch";

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
                      ingredient.name
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
                                <li key={ingredient.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onToggle(ingredient.id);
                                            setQuery("");
                                        }}
                                        className={
                                            styles[
                                                "add-ingredient-modal__result"
                                            ]
                                        }
                                    >
                                        <span>
                                            <HighlightedMatch
                                                text={ingredient.name}
                                                query={trimmedQuery}
                                            />
                                        </span>
                                        <span
                                            className={
                                                styles[
                                                    "add-ingredient-modal__result-unit"
                                                ]
                                            }
                                        >
                                            {ingredient.unit_name}
                                        </span>
                                        <AllergenDot
                                            allergens={ingredient.allergens}
                                        />
                                    </button>
                                </li>
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
                            {ingredient.name}
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
