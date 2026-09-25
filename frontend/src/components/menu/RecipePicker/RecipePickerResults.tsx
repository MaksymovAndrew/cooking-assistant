import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeListItem } from "types/recipe";

import { HighlightedMatch } from "components/ui/HighlightedMatch";

import { recipeTypeName } from "utils/referenceLabels";

import styles from "./RecipePicker.module.scss";

interface RecipePickerResultsProps {
    matches: RecipeListItem[];
    query: string;
    onSelect: (recipe: RecipeListItem) => void;
}

export const RecipePickerResults: React.FC<RecipePickerResultsProps> = ({
    matches,
    query,
    onSelect,
}) => {
    const { t } = useTranslation("menu");

    return (
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
                                    onSelect(recipe);
                                }}
                                className={styles["recipe-picker__result"]}
                            >
                                <span
                                    className={
                                        styles["recipe-picker__result-name"]
                                    }
                                >
                                    <HighlightedMatch
                                        text={recipe.title}
                                        query={query}
                                    />
                                </span>
                                <span
                                    className={
                                        styles["recipe-picker__result-type"]
                                    }
                                >
                                    {recipeTypeName(t, recipe.type_name)}
                                </span>
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};
