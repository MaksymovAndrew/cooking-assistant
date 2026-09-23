import React, { useState } from "react";

import type { RecipeFormIngredient } from "types/recipeForm";

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
    const [draggedId, setDraggedId] = useState<number | null>(null);

    return (
        <div className={styles["selected-ingredients-list"]}>
            {ingredients.map((ingredient) => (
                <SelectedIngredientRow
                    key={ingredient.id}
                    ingredient={ingredient}
                    onQuantityChange={onQuantityChange}
                    onRemove={onRemove}
                    onDragStart={() => {
                        setDraggedId(ingredient.id);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    onDrop={(e) => {
                        e.preventDefault();

                        if (draggedId !== null) {
                            onReorder(draggedId, ingredient.id);
                        }

                        setDraggedId(null);
                    }}
                    onDragEnd={() => {
                        setDraggedId(null);
                    }}
                />
            ))}
        </div>
    );
};
