import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { Chip } from "components/ui/Chip";

import { resolveIngredientName } from "utils/ingredientName";

import styles from "./AddIngredientModal.module.scss";

interface SelectedIngredientChipsProps {
    ingredients: Ingredient[];
    onRemove: (id: number) => void;
}

// what this batch will add so far, each one removable before it is saved
export const SelectedIngredientChips: React.FC<
    SelectedIngredientChipsProps
> = ({ ingredients, onRemove }) => {
    const { t } = useTranslation();

    if (ingredients.length === 0) {
        return null;
    }

    return (
        <div className={styles["add-ingredient-modal__selected"]}>
            {ingredients.map((ingredient) => (
                <Chip
                    key={ingredient.id}
                    removable
                    onRemove={() => {
                        onRemove(ingredient.id);
                    }}
                >
                    {resolveIngredientName(t, ingredient)}
                </Chip>
            ))}
        </div>
    );
};
