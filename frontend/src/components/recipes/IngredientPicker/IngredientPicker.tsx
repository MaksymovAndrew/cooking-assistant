import { Search, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { HighlightedMatch } from "components/ui/HighlightedMatch";

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
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const trimmedQuery = query.trim();

    const matches = trimmedQuery
        ? allIngredients
              .filter(
                  (ingredient) =>
                      !selectedIds.includes(ingredient.id) &&
                      ingredient.name
                          .toLowerCase()
                          .includes(trimmedQuery.toLowerCase()),
              )
              .slice(0, MAX_RESULTS)
        : [];

    const handleSelect = (ingredient: Ingredient) => {
        onToggle(ingredient);
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <div className={styles["ingredient-picker"]}>
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
                    onChange={(e) => {
                        setQuery(e.target.value);
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
            {trimmedQuery && (
                <ul className={styles["ingredient-picker__results"]}>
                    {matches.length === 0 ? (
                        <li className={styles["ingredient-picker__empty"]}>
                            {t("ingredientPicker.noMatches")}
                        </li>
                    ) : (
                        matches.map((ingredient) => (
                            <li key={ingredient.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSelect(ingredient);
                                    }}
                                    className={
                                        styles["ingredient-picker__result"]
                                    }
                                >
                                    <span
                                        className={
                                            styles[
                                                "ingredient-picker__result-name"
                                            ]
                                        }
                                    >
                                        <HighlightedMatch
                                            text={ingredient.name}
                                            query={trimmedQuery}
                                        />
                                    </span>
                                    <span
                                        className={
                                            styles[
                                                "ingredient-picker__result-unit"
                                            ]
                                        }
                                    >
                                        {ingredient.unit_name}
                                    </span>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};
