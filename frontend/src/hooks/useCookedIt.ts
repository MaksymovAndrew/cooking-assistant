import { useRef, useState } from "react";

import { MIN_COOKED_PORTIONS } from "constants/cooking";
import type { CookRequirement } from "types/pantryConsumption";

import { useAppDispatch } from "redux/hooks";
import { useCookRecordMutation } from "redux/services/pantryConsumptionApi";
import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";
import { closeModal } from "redux/slices/uiSlice";

import { buildCookPreview } from "utils/cookPreview";

interface CookedItTarget {
    modalId: string;
    recipeId?: number;
    menuId?: number;
    requirements: CookRequirement[];
    initialPortions?: number;
}

// the success toast, with its undo, is raised by the pantry listener once the request lands
export const useCookedIt = ({
    modalId,
    recipeId,
    menuId,
    requirements,
    initialPortions,
}: CookedItTarget) => {
    const dispatch = useAppDispatch();
    const [portions, setPortions] = useState(
        initialPortions ?? MIN_COOKED_PORTIONS,
    );
    const [logCalories, setLogCalories] = useState(false);
    const { data: pantry, isLoading: isPantryLoading } =
        useGetUserIngredientsQuery(null);
    const [cookRecord, { isLoading: isCooking }] = useCookRecordMutation();
    // a second press can land before the disabled state renders; one cooking must never post twice
    const isSubmitting = useRef(false);

    const close = () => dispatch(closeModal(modalId));

    const confirm = async () => {
        if (isSubmitting.current) {
            return;
        }

        isSubmitting.current = true;
        const result = await cookRecord({
            recipe_id: recipeId,
            menu_id: menuId,
            portions,
            log_calories: logCalories,
        });

        // stays locked after a success: the modal is closing, and the cooking is done
        if ("data" in result) {
            close();

            return;
        }

        isSubmitting.current = false;
    };

    return {
        portions,
        setPortions,
        logCalories,
        setLogCalories,
        preview: buildCookPreview(requirements, pantry ?? [], portions),
        isPantryLoading,
        isCooking,
        close,
        confirm,
    };
};
