import React from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { NumberInput } from "components/ui/NumberInput";

import { resolveIngredientName } from "utils/ingredientName";
import { unitName } from "utils/referenceLabels";

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
    const editableQuantity = useEditableQuantity(
        quantity,
        onQuantityChange,
        MIN_QUANTITY,
    );
    const name = resolveIngredientName(t, ingredient);

    return (
        <div className={styles["add-ingredient-modal__quantity-step"]}>
            <span className={styles["add-ingredient-modal__step-count"]}>
                {t("addIngredientModal.stepCount", {
                    current: stepNumber,
                    total: stepCount,
                })}
            </span>
            <span className={styles["add-ingredient-modal__quantity-name"]}>
                {name}
            </span>
            <div className={styles["add-ingredient-modal__quantity-input"]}>
                <NumberInput
                    aria-label={t("common:chip.quantity", { name })}
                    min={MIN_QUANTITY}
                    value={editableQuantity.text}
                    onChange={editableQuantity.onChange}
                    onBlur={editableQuantity.onBlur}
                />
                <span>
                    {unitName(
                        t,
                        ingredient.unit_name,
                        Number(editableQuantity.text),
                    )}
                </span>
            </div>
        </div>
    );
};
