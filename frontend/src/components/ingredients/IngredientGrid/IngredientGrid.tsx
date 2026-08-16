import React from "react";

import type { PantryIngredient } from "types/userIngredient";

import { BasketMark } from "components/icons";
import { IngredientCard } from "components/ingredients/IngredientCard";
import { EmptyState } from "components/ui/EmptyState";

import styles from "./IngredientGrid.module.scss";

interface IngredientGridProps {
    ingredients: PantryIngredient[];
    emptyMessage: string;
    onOpenHistory: (ingredient: PantryIngredient) => void;
    onRestock: (ingredient: PantryIngredient) => void;
    onDelete: (ingredient: PantryIngredient) => void;
}

export const IngredientGrid: React.FC<IngredientGridProps> = ({
    ingredients,
    emptyMessage,
    onOpenHistory,
    onRestock,
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
                    onOpenHistory={onOpenHistory}
                    onRestock={onRestock}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
