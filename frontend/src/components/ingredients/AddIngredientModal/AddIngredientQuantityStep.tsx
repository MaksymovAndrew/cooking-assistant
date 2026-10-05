import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { FormField } from "components/ui/FormField";
import { QuantityField } from "components/ui/QuantityField";

import { joinDescribedBy } from "utils/fieldDescription";
import { resolveIngredientName } from "utils/ingredientName";
import { ingredientSummary } from "utils/ingredientSummary";
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
const FULL_PERCENT = 100;
const QUANTITY_FIELD_ID = "add-ingredient-quantity";
const STEP_COUNT_ID = `${QUANTITY_FIELD_ID}-step`;
const PRODUCT_NAME_ID = `${QUANTITY_FIELD_ID}-product`;

export const AddIngredientQuantityStep: React.FC<
    AddIngredientQuantityStepProps
> = ({ ingredient, quantity, stepNumber, stepCount, onQuantityChange }) => {
    const { t } = useTranslation("ingredients");
    const inputRef = useRef<HTMLInputElement>(null);
    const editableQuantity = useEditableQuantity(
        quantity,
        onQuantityChange,
        MIN_QUANTITY,
    );
    const name = resolveIngredientName(t, ingredient);
    const hasSeveralSteps = stepCount > 1;

    // every step moves focus into the field; it would otherwise stay on the Next button
    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, [ingredient.id]);

    return (
        <div className={styles["add-ingredient-modal__quantity-step"]}>
            {hasSeveralSteps && (
                <div className={styles["add-ingredient-modal__progress"]}>
                    <span
                        id={STEP_COUNT_ID}
                        className={styles["add-ingredient-modal__step-count"]}
                    >
                        {t("addIngredientModal.stepCount", {
                            current: stepNumber,
                            total: stepCount,
                        })}
                    </span>
                    <span
                        className={
                            styles["add-ingredient-modal__progress-track"]
                        }
                        aria-hidden="true"
                    >
                        <span
                            className={
                                styles["add-ingredient-modal__progress-fill"]
                            }
                            style={{
                                width: `${(stepNumber / stepCount) * FULL_PERCENT}%`,
                            }}
                        />
                    </span>
                </div>
            )}
            <div className={styles["add-ingredient-modal__product"]}>
                <span
                    id={PRODUCT_NAME_ID}
                    className={styles["add-ingredient-modal__product-name"]}
                >
                    {name}
                </span>
                <span className={styles["add-ingredient-modal__product-meta"]}>
                    {ingredientSummary(t, ingredient)}
                </span>
            </div>
            <FormField
                label={t("addIngredientModal.quantityLabel")}
                htmlFor={QUANTITY_FIELD_ID}
            >
                <QuantityField
                    ref={inputRef}
                    id={QUANTITY_FIELD_ID}
                    aria-describedby={joinDescribedBy(
                        hasSeveralSteps ? STEP_COUNT_ID : null,
                        PRODUCT_NAME_ID,
                    )}
                    min={MIN_QUANTITY}
                    unit={unitName(
                        t,
                        ingredient.unit_name,
                        Number(editableQuantity.text),
                    )}
                    value={editableQuantity.text}
                    onChange={editableQuantity.onChange}
                    onBlur={editableQuantity.onBlur}
                />
            </FormField>
        </div>
    );
};
