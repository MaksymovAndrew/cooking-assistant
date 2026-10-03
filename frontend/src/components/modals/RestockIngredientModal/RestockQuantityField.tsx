import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import type { useEditableQuantity } from "hooks/useEditableQuantity";
import { useLocale } from "hooks/useLocale";

import { NumberInput } from "components/ui/NumberInput";

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
            <div className={styles["restock-modal__input"]}>
                <NumberInput
                    min={min}
                    value={quantity.text}
                    onChange={quantity.onChange}
                    onBlur={quantity.onBlur}
                />
                <span>
                    {unitName(t, ingredient.unit_name, Number(quantity.text))}
                </span>
            </div>
        </>
    );
};
