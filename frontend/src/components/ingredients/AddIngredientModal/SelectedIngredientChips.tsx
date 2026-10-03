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

export const SelectedIngredientChips: React.FC<
    SelectedIngredientChipsProps
> = ({ ingredients, onRemove }) => {
    const { t } = useTranslation();

    if (ingredients.length === 0) {
        return null;
    }

    return (
        <div className={styles["add-ingredient-modal__selected"]}>
            {ingredients.map((ingredient) => {
                const name = resolveIngredientName(t, ingredient);

                return (
                    <Chip
                        key={ingredient.id}
                        removable
                        name={name}
                        onRemove={() => {
                            onRemove(ingredient.id);
                        }}
                    >
                        {name}
                    </Chip>
                );
            })}
        </div>
    );
};
