import { Search, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { RecipeListItem } from "types/recipe";

import { HighlightedMatch } from "components/ui/HighlightedMatch";

import styles from "./RecipePicker.module.scss";

interface RecipePickerProps {
    allRecipes: RecipeListItem[];
    selectedIds: number[];
    label: string;
    onToggle: (recipe: RecipeListItem) => void;
}

const SEARCH_ICON_SIZE = 17;
const CLEAR_ICON_SIZE = 13;
const MAX_RESULTS = 8;

export const RecipePicker: React.FC<RecipePickerProps> = ({
    allRecipes,
    selectedIds,
    label,
    onToggle,
}) => {
    const { t } = useTranslation("menu");
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const trimmedQuery = query.trim();

    const matches = trimmedQuery
        ? allRecipes
              .filter(
                  (recipe) =>
                      !selectedIds.includes(recipe.id) &&
                      recipe.title
                          .toLowerCase()
                          .includes(trimmedQuery.toLowerCase()),
              )
              .slice(0, MAX_RESULTS)
        : [];

    const handleSelect = (recipe: RecipeListItem) => {
        onToggle(recipe);
        setQuery("");
        inputRef.current?.focus();
    };

    return (
        <div className={styles["recipe-picker"]}>
            <label
                htmlFor="recipe-picker-search"
                className={styles["recipe-picker__label"]}
            >
                {label}
            </label>
            <div className={styles["recipe-picker__search"]}>
                <Search size={SEARCH_ICON_SIZE} aria-hidden="true" />
                <input
                    id="recipe-picker-search"
                    ref={inputRef}
                    type="text"
                    autoComplete="off"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                    }}
                    placeholder={t("recipePicker.searchPlaceholder")}
                    className={styles["recipe-picker__input"]}
                />
                {query && (
                    <button
                        type="button"
                        aria-label={t("recipePicker.clear")}
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
                <div className={styles["recipe-picker__results-wrapper"]}>
                    <ul className={styles["recipe-picker__results"]}>
                        {matches.length === 0 ? (
                            <li className={styles["recipe-picker__empty"]}>
                                {t("recipePicker.noMatches")}
                            </li>
                        ) : (
                            matches.map((recipe) => (
                                <li key={recipe.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleSelect(recipe);
                                        }}
                                        className={
                                            styles["recipe-picker__result"]
                                        }
                                    >
                                        <span
                                            className={
                                                styles[
                                                    "recipe-picker__result-name"
                                                ]
                                            }
                                        >
                                            <HighlightedMatch
                                                text={recipe.title}
                                                query={trimmedQuery}
                                            />
                                        </span>
                                        <span
                                            className={
                                                styles[
                                                    "recipe-picker__result-type"
                                                ]
                                            }
                                        >
                                            {recipe.type_name}
                                        </span>
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};
