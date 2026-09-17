import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { ShoppingListIngredientEntry } from "types/shoppingList";

import { useAppDispatch } from "redux/hooks";
import { useAddIngredientsToShoppingListMutation } from "redux/services/shoppingListApi";
import { addNotification } from "redux/slices/notificationsSlice";

// failures surface through the global error toast, so the handler only swallows the rejected promise
const ignoreRejection = () => undefined;

// sends catalog ingredients to the list from anywhere in the app; the server merges an ingredient
// already waiting to be bought instead of listing it twice
export const useAddToShoppingList = () => {
    const { t } = useTranslation("shoppingList");
    const dispatch = useAppDispatch();
    const [addIngredients, { isLoading }] =
        useAddIngredientsToShoppingListMutation();

    const add = (items: ShoppingListIngredientEntry[]) => {
        if (items.length === 0 || isLoading) {
            return;
        }

        addIngredients({ items })
            .unwrap()
            .then(() => {
                dispatch(
                    addNotification({
                        type: "success",
                        message: t("addFromElsewhere.added"),
                        link: {
                            href: ROUTES.shoppingList,
                            label: t("addFromElsewhere.openList"),
                        },
                    }),
                );
            })
            .catch(ignoreRejection);
    };

    return { add, isAdding: isLoading };
};
