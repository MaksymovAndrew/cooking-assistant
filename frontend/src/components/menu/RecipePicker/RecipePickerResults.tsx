import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeListItem } from "types/recipe";

import { HighlightedMatch } from "components/ui/HighlightedMatch";

import { recipeTypeLabel } from "utils/referenceLabels";

import styles from "./RecipePicker.module.scss";

interface RecipePickerResultsProps {
    matches: RecipeListItem[];
    query: string;
    isSearching: boolean;
    hasMore: boolean;
    loadMore: () => void;
    onSelect: (recipe: RecipeListItem) => void;
}

export const RecipePickerResults: React.FC<RecipePickerResultsProps> = ({
    matches,
    query,
    isSearching,
    hasMore,
    loadMore,
    onSelect,
}) => {
    const { t } = useTranslation("menu");
    const isEmpty = matches.length === 0 && !isSearching && !hasMore;

    return (
        <div className={styles["recipe-picker__results-wrapper"]}>
            <ul
                className={styles["recipe-picker__results"]}
                aria-busy={isSearching}
            >
                {isEmpty && (
                    <li className={styles["recipe-picker__empty"]}>
                        {t("recipePicker.noMatches")}
                    </li>
                )}
                {matches.map((recipe) => (
                    <li key={recipe.id}>
                        <button
                            type="button"
                            onClick={() => {
                                onSelect(recipe);
                            }}
                            className={styles["recipe-picker__result"]}
                        >
                            <span
                                className={styles["recipe-picker__result-name"]}
                            >
                                <HighlightedMatch
                                    text={recipe.title}
                                    query={query}
                                />
                            </span>
                            <span
                                className={styles["recipe-picker__result-type"]}
                            >
                                {recipeTypeLabel(t, recipe.type_name)}
                            </span>
                        </button>
                    </li>
                ))}
                {isSearching && (
                    <li
                        className={styles["recipe-picker__empty"]}
                        role="status"
                    >
                        {t("recipePicker.searching")}
                    </li>
                )}
                {hasMore && !isSearching && (
                    <li>
                        <button
                            type="button"
                            onClick={loadMore}
                            className={styles["recipe-picker__more"]}
                        >
                            {t("recipePicker.loadMore")}
                        </button>
                    </li>
                )}
            </ul>
        </div>
    );
};
