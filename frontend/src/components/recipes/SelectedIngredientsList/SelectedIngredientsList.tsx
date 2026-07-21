import { X } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import type { RecipeFormIngredient } from "types/recipe";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { GripMark } from "components/icons";
import { NumberInput } from "components/ui/NumberInput";

import styles from "./SelectedIngredientsList.module.scss";

interface SelectedIngredientsListProps {
    ingredients: RecipeFormIngredient[];
    onQuantityChange: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
    onReorder: (fromId: number, toId: number) => void;
}

interface SelectedIngredientRowProps {
    ingredient: RecipeFormIngredient;
    onQuantityChange: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
}

const REMOVE_ICON_SIZE = 15;
const GRIP_ICON_SIZE = 16;

const SelectedIngredientRow: React.FC<SelectedIngredientRowProps> = ({
    ingredient,
    onQuantityChange,
    onRemove,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}) => {
    const { t } = useTranslation();
    const quantity = useEditableQuantity(
        ingredient.quantity,
        (value) => {
            onQuantityChange(ingredient.id, value);
        },
        1,
    );

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={styles["selected-ingredients-list__row"]}
        >
            <GripMark
                size={GRIP_ICON_SIZE}
                className={styles["selected-ingredients-list__grip"]}
            />
            <span className={styles["selected-ingredients-list__name"]}>
                {ingredient.name}
            </span>
            <NumberInput
                min={1}
                value={quantity.text}
                onChange={quantity.onChange}
                onBlur={quantity.onBlur}
                className={styles["selected-ingredients-list__quantity"]}
            />
            <span className={styles["selected-ingredients-list__unit"]}>
                {ingredient.unit_name}
            </span>
            <button
                type="button"
                aria-label={t("chip.remove")}
                onClick={() => {
                    onRemove(ingredient.id);
                }}
                className={styles["selected-ingredients-list__remove"]}
            >
                <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
            </button>
        </div>
    );
};

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
