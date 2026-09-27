import { Check, Plus } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { HighlightedMatch } from "components/ui/HighlightedMatch";

import { resolveIngredientName } from "utils/ingredientName";

import styles from "./FoodPreferences.module.scss";

interface AvoidIngredientResultsProps {
    query: string;
    results: Ingredient[];
    ingredientIds: number[];
    isDisabled: boolean;
    onSelect: (ingredient: Ingredient) => void;
}

const ROW_ICON_SIZE = 15;

// already-avoided matches stay in the list, dimmed, so a second tap takes them back off
export const AvoidIngredientResults: React.FC<AvoidIngredientResultsProps> = ({
    query,
    results,
    ingredientIds,
    isDisabled,
    onSelect,
}) => {
    const { t } = useTranslation("dietPreferences");

    if (results.length === 0) {
        return (
            <div className={styles["food-preferences__results"]}>
                <p className={styles["food-preferences__no-results"]}>
                    {t("ingredients.noMatches", { query })}
                    <span>{t("ingredients.noMatchesHint")}</span>
                </p>
            </div>
        );
    }

    return (
        <ul className={styles["food-preferences__results"]}>
            {results.map((ingredient) => {
                const isAvoided = ingredientIds.includes(ingredient.id);
                const name = resolveIngredientName(t, ingredient);

                return (
                    <li key={ingredient.id}>
                        <button
                            type="button"
                            // the highlighted match splits the text, so the name is given whole
                            aria-label={name}
                            aria-pressed={isAvoided}
                            disabled={isDisabled}
                            onClick={() => {
                                onSelect(ingredient);
                            }}
                            className={[
                                styles["food-preferences__result"],
                                isAvoided &&
                                    styles["food-preferences__result--avoided"],
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            {isAvoided ? (
                                <Check
                                    size={ROW_ICON_SIZE}
                                    aria-hidden="true"
                                    className={
                                        styles["food-preferences__result-check"]
                                    }
                                />
                            ) : (
                                <Plus size={ROW_ICON_SIZE} aria-hidden="true" />
                            )}
                            <span
                                className={
                                    styles["food-preferences__result-name"]
                                }
                            >
                                <HighlightedMatch text={name} query={query} />
                            </span>
                            {isAvoided && (
                                <span
                                    className={
                                        styles["food-preferences__result-tag"]
                                    }
                                >
                                    {t("ingredients.avoidedTag")}
                                </span>
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};
