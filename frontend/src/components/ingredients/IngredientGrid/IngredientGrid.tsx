import React from "react";

import type { PantryIngredient } from "types/userIngredient";

import { BasketMark } from "components/icons";
import { IngredientCard } from "components/ingredients/IngredientCard";
import { EmptyState } from "components/ui/EmptyState";

import styles from "./IngredientGrid.module.scss";

interface IngredientGridProps {
    ingredients: PantryIngredient[];
    emptyMessage: string;
    isEditingQuantity: boolean;
    onQuantityChange: (id: number, quantity: number) => void;
    onSaveQuantity: (id: number) => void;
    onOpenHistory: (ingredient: PantryIngredient) => void;
    onDelete: (ingredient: PantryIngredient) => void;
}

export const IngredientGrid: React.FC<IngredientGridProps> = ({
    ingredients,
    emptyMessage,
    isEditingQuantity,
    onQuantityChange,
    onSaveQuantity,
    onOpenHistory,
    onDelete,
}) => {
    if (ingredients.length === 0) {
        return <EmptyState icon={BasketMark} title={emptyMessage} />;
    }

    return (
        <div className={styles["ingredient-grid"]}>
            {ingredients.map((ingredient) => (
                <IngredientCard
                    key={ingredient.id}
                    ingredient={ingredient}
                    isEditingQuantity={isEditingQuantity}
                    onQuantityChange={onQuantityChange}
                    onSaveQuantity={onSaveQuantity}
                    onOpenHistory={onOpenHistory}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
