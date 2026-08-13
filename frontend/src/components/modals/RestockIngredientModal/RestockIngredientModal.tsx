import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useAppDispatch } from "redux/hooks";
import { useSaveUserIngredientMutation } from "redux/services/userIngredientsApi";
import { closeModal } from "redux/slices/uiSlice";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";
import { NumberInput } from "components/ui/NumberInput";

import { resolvePantryIngredientName, resolveUnit } from "utils/ingredientName";

import styles from "./RestockIngredientModal.module.scss";

interface RestockIngredientModalProps {
    modalId: string;
    ingredient: PantryIngredient;
}

const DEFAULT_QUANTITY = 1;
const MIN_QUANTITY = 0.01;

// buying more of an ingredient you already have: this reuses the same saveUserIngredient
// endpoint AddIngredientModal uses for brand-new ingredients - it already adds to the existing
// quantity and logs a new purchase lot dated today, leaving older lots (and their expiry) alone
export const RestockIngredientModal = ({
    modalId,
    ingredient,
}: RestockIngredientModalProps) => {
    const { t } = useTranslation("ingredients");
    const dispatch = useAppDispatch();
    const [saveUserIngredient, { isLoading }] = useSaveUserIngredientMutation();
    const [addedQuantity, setAddedQuantity] = useState(DEFAULT_QUANTITY);
    const editableQuantity = useEditableQuantity(
        addedQuantity,
        setAddedQuantity,
        MIN_QUANTITY,
    );
    const displayName = resolvePantryIngredientName(ingredient);
    const displayUnit = resolveUnit(ingredient.unit_name);

    const handleClose = () => dispatch(closeModal(modalId));

    const handleConfirm = async () => {
        // a failed mutation is already toasted by the global listener
        const result = await saveUserIngredient({
            ingredients: [
                {
                    id: ingredient.id,
                    ingredient_name:
                        ingredient.ingredient_name ?? ingredient.name ?? "",
                    quantity_person_ingradient: addedQuantity,
                },
            ],
        });

        if ("data" in result) {
            handleClose();
        }
    };

    return (
        <BaseModal
            size="sm"
            title={t("restockModal.title", { name: displayName })}
            onClose={handleClose}
            footer={
                <>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        {t("addIngredientModal.cancelButton")}
                    </Button>
                    <Button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                            handleConfirm().catch(() => undefined);
                        }}
                    >
                        {t("restockModal.confirmButton")}
                    </Button>
                </>
            }
        >
            <p className={styles["restock-modal__current"]}>
                {t("restockModal.current", {
                    quantity: ingredient.quantity_person_ingradient,
                    unit: displayUnit,
                })}
            </p>
            <div className={styles["restock-modal__input"]}>
                <NumberInput
                    min={MIN_QUANTITY}
                    value={editableQuantity.text}
                    onChange={editableQuantity.onChange}
                    onBlur={editableQuantity.onBlur}
                />
                <span>{displayUnit}</span>
            </div>
        </BaseModal>
    );
};
