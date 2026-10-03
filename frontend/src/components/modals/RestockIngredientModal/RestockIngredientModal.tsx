import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { PantryIngredient } from "types/userIngredient";

import { useAppDispatch } from "redux/hooks";
import { useSaveUserIngredientMutation } from "redux/services/userIngredientsApi";
import { closeModal } from "redux/slices/uiSlice";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { BaseModal } from "components/modals/BaseModal";
import { Button } from "components/ui/Button";

import { resolvePantryIngredientName } from "utils/ingredientName";
import { restockRequest } from "utils/restockRequest";

import { RestockQuantityField } from "./RestockQuantityField";

interface RestockIngredientModalProps {
    modalId: string;
    ingredient: PantryIngredient;
}

const DEFAULT_QUANTITY = 1;
const MIN_QUANTITY = 0.01;

// saveUserIngredient adds a new lot dated today, leaving older lots and their expiry alone
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
    const displayName = resolvePantryIngredientName(t, ingredient);

    const handleClose = () => dispatch(closeModal(modalId));

    const handleConfirm = async () => {
        // a failed mutation is already toasted by the global listener
        const result = await saveUserIngredient(
            restockRequest(ingredient, addedQuantity),
        );

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
            <RestockQuantityField
                ingredient={ingredient}
                quantity={editableQuantity}
                min={MIN_QUANTITY}
            />
        </BaseModal>
    );
};
