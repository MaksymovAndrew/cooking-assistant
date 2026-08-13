import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { NumberInput } from "components/ui/NumberInput";

import { resolveIngredientName, resolveUnit } from "utils/ingredientName";

import styles from "./AddIngredientModal.module.scss";

interface AddIngredientQuantityStepProps {
    ingredient: Ingredient;
    quantity: number;
    stepNumber: number;
    stepCount: number;
    onQuantityChange: (quantity: number) => void;
}

const MIN_QUANTITY = 0.01;

export const AddIngredientQuantityStep: React.FC<
    AddIngredientQuantityStepProps
> = ({ ingredient, quantity, stepNumber, stepCount, onQuantityChange }) => {
    const { t } = useTranslation("ingredients");
    // lets the field go empty while typing (e.g. clearing "1" before typing "5") instead of
    // snapping back on every keystroke, same pattern as PurchaseItem's quantity editor
    const editableQuantity = useEditableQuantity(
        quantity,
        onQuantityChange,
        MIN_QUANTITY,
    );

    return (
        <div className={styles["add-ingredient-modal__quantity-step"]}>
            <span className={styles["add-ingredient-modal__step-count"]}>
                {t("addIngredientModal.stepCount", {
                    current: stepNumber,
                    total: stepCount,
                })}
            </span>
            <span className={styles["add-ingredient-modal__quantity-name"]}>
                {resolveIngredientName(ingredient)}
            </span>
            <div className={styles["add-ingredient-modal__quantity-input"]}>
                <NumberInput
                    min={MIN_QUANTITY}
                    value={editableQuantity.text}
                    onChange={editableQuantity.onChange}
                    onBlur={editableQuantity.onBlur}
                />
                <span>{resolveUnit(ingredient.unit_name)}</span>
            </div>
        </div>
    );
};
