import { X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

import type { RecipeFormIngredient } from "types/recipeForm";
import type { MoveDirection } from "types/reorder";

import type { DragRowProps } from "hooks/useDragReorder";
import { useEditableQuantity } from "hooks/useEditableQuantity";

import { GripMark } from "components/icons";
import { MoveButtons } from "components/ui/MoveButtons";
import { NumberInput } from "components/ui/NumberInput";

import { resolveIngredientName } from "utils/ingredientName";
import { unitName } from "utils/referenceLabels";

import styles from "./SelectedIngredientsList.module.scss";

interface SelectedIngredientRowProps {
    ingredient: RecipeFormIngredient;
    onQuantityChange: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
    dragProps: DragRowProps;
    isFirst: boolean;
    isLast: boolean;
    onMove: (direction: MoveDirection) => void;
}

const REMOVE_ICON_SIZE = 15;
const GRIP_ICON_SIZE = 16;

export const SelectedIngredientRow: React.FC<SelectedIngredientRowProps> = ({
    ingredient,
    onQuantityChange,
    onRemove,
    dragProps,
    isFirst,
    isLast,
    onMove,
}) => {
    const { t } = useTranslation();
    const name = resolveIngredientName(t, ingredient);
    const quantity = useEditableQuantity(
        ingredient.quantity,
        (value) => {
            onQuantityChange(ingredient.id, value);
        },
        1,
    );

    return (
        <div
            {...dragProps}
            className={styles["selected-ingredients-list__row"]}
        >
            <GripMark
                size={GRIP_ICON_SIZE}
                className={styles["selected-ingredients-list__grip"]}
            />
            <span className={styles["selected-ingredients-list__name"]}>
                {name}
            </span>
            <div className={styles["selected-ingredients-list__controls"]}>
                <NumberInput
                    min={1}
                    aria-label={t("chip.quantity", { name })}
                    value={quantity.text}
                    onChange={quantity.onChange}
                    onBlur={quantity.onBlur}
                    className={styles["selected-ingredients-list__quantity"]}
                />
                <span className={styles["selected-ingredients-list__unit"]}>
                    {unitName(t, ingredient.unit_name, Number(quantity.text))}
                </span>
                <MoveButtons
                    name={name}
                    isFirst={isFirst}
                    isLast={isLast}
                    onMove={onMove}
                />
                <button
                    type="button"
                    aria-label={t("chip.remove", { name })}
                    onClick={() => {
                        onRemove(ingredient.id);
                    }}
                    className={styles["selected-ingredients-list__remove"]}
                >
                    <X size={REMOVE_ICON_SIZE} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};
