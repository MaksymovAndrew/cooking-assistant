import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeFormIngredient } from "types/recipeForm";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { GripMark } from "components/icons";
import { NumberInput } from "components/ui/NumberInput";

import { resolveIngredientName } from "utils/ingredientName";

import styles from "./SelectedIngredientsList.module.scss";

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

export const SelectedIngredientRow: React.FC<SelectedIngredientRowProps> = ({
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
                {resolveIngredientName(ingredient)}
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
