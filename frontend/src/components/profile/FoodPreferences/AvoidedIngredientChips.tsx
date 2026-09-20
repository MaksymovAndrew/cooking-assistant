import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { resolveIngredientName } from "utils/ingredientName";

import styles from "./FoodPreferences.module.scss";

interface AvoidedIngredientChipsProps {
    ingredients: Ingredient[];
    isDisabled: boolean;
    onRemove: (ingredient: Ingredient) => void;
}

const REMOVE_ICON_SIZE = 12;

export const AvoidedIngredientChips: React.FC<AvoidedIngredientChipsProps> = ({
    ingredients,
    isDisabled,
    onRemove,
}) => {
    const { t } = useTranslation("dietPreferences");

    if (ingredients.length === 0) {
        return (
            <p className={styles["food-preferences__empty"]}>
                {t("ingredients.empty")}
            </p>
        );
    }

    return (
        <ul className={styles["food-preferences__avoided"]}>
            {ingredients.map((ingredient) => {
                const name = resolveIngredientName(ingredient);

                return (
                    <li
                        key={ingredient.id}
                        className={styles["food-preferences__avoided-chip"]}
                    >
                        {name}
                        <button
                            type="button"
                            disabled={isDisabled}
                            aria-label={t("ingredients.remove", { name })}
                            onClick={() => {
                                onRemove(ingredient);
                            }}
                            className={styles["food-preferences__remove"]}
                        >
                            <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};
