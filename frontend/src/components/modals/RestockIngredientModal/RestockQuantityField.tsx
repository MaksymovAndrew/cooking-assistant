import { useId } from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import type { useEditableQuantity } from "hooks/useEditableQuantity";
import { useLocale } from "hooks/useLocale";

import { FormField } from "components/ui/FormField";
import { QuantityField } from "components/ui/QuantityField";

import { unitName } from "utils/referenceLabels";
import { formatQuantity } from "utils/roundQuantity";

import styles from "./RestockIngredientModal.module.scss";

interface RestockQuantityFieldProps {
    ingredient: PantryIngredient;
    quantity: ReturnType<typeof useEditableQuantity>;
    min: number;
}

export const RestockQuantityField = ({
    ingredient,
    quantity,
    min,
}: RestockQuantityFieldProps) => {
    const { t } = useTranslation("ingredients");
    const locale = useLocale();
    const inputId = useId();

    return (
        <>
            <p className={styles["restock-modal__current"]}>
                {t("restockModal.current", {
                    quantity: formatQuantity(
                        ingredient.quantity_person_ingradient,
                        locale,
                    ),
                    unit: unitName(
                        t,
                        ingredient.unit_name,
                        ingredient.quantity_person_ingradient,
                    ),
                })}
            </p>
            <FormField
                label={t("addIngredientModal.quantityLabel")}
                htmlFor={inputId}
            >
                <QuantityField
                    id={inputId}
                    min={min}
                    unit={unitName(
                        t,
                        ingredient.unit_name,
                        Number(quantity.text),
                    )}
                    value={quantity.text}
                    onChange={quantity.onChange}
                    onBlur={quantity.onBlur}
                />
            </FormField>
        </>
    );
};
