import { useTranslation } from "react-i18next";

import type { ExpiredPantryIngredient } from "types/expiry";

import { useAppDispatch } from "redux/hooks";
import { useDiscardPurchasesMutation } from "redux/services/userIngredientsApi";
import { addNotification } from "redux/slices/notificationsSlice";
import { closeModal } from "redux/slices/uiSlice";

import { useAddToShoppingList } from "hooks/useAddToShoppingList";

// failures surface through the global error toast, so the handler only swallows the rejected promise
const ignoreRejection = () => undefined;

// what the expired-ingredients notice can do about what it lists: throw it all out, or rebuy it
export const useExpiredIngredientsActions = (
    modalId: string,
    ingredients: ExpiredPantryIngredient[],
) => {
    const { t } = useTranslation("ingredients");
    const dispatch = useAppDispatch();
    const [discardPurchases, { isLoading: isDiscarding }] =
        useDiscardPurchasesMutation();
    const { add, isAdding } = useAddToShoppingList();

    const discard = () => {
        const purchaseIds = ingredients.flatMap((ingredient) =>
            ingredient.lots.map((lot) => lot.purchaseId),
        );

        discardPurchases(purchaseIds)
            .unwrap()
            .then(() => {
                dispatch(closeModal(modalId));
                dispatch(
                    addNotification({
                        type: "success",
                        message: t("expiredNoticeModal.discarded"),
                    }),
                );
            })
            .catch(ignoreRejection);
    };

    // how much to rebuy is the shopper's call, so the items go on the list by name
    const addToShoppingList = () => {
        add(
            ingredients.map((ingredient) => ({
                ingredient_id: ingredient.ingredientId,
                quantity: null,
            })),
        );
    };

    return { discard, isDiscarding, addToShoppingList, isAdding };
};
