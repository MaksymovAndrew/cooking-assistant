import React from "react";

import type { RecipeFormIngredient } from "types/recipeForm";

import { useDragReorder } from "hooks/useDragReorder";

import { SelectedIngredientRow } from "./SelectedIngredientRow";
import styles from "./SelectedIngredientsList.module.scss";

interface SelectedIngredientsListProps {
    ingredients: RecipeFormIngredient[];
    onQuantityChange: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
    onReorder: (fromId: number, toId: number) => void;
}

export const SelectedIngredientsList: React.FC<
    SelectedIngredientsListProps
> = ({ ingredients, onQuantityChange, onRemove, onReorder }) => {
    const { dragProps, move } = useDragReorder(
        ingredients.map((ingredient) => ingredient.id),
        onReorder,
    );

    return (
        <div className={styles["selected-ingredients-list"]}>
            {ingredients.map((ingredient, index) => (
                <SelectedIngredientRow
                    key={ingredient.id}
                    ingredient={ingredient}
                    onQuantityChange={onQuantityChange}
                    onRemove={onRemove}
                    dragProps={dragProps(ingredient.id)}
                    isFirst={index === 0}
                    isLast={index === ingredients.length - 1}
                    onMove={(direction) => {
                        move(ingredient.id, direction);
                    }}
                />
            ))}
        </div>
    );
};
