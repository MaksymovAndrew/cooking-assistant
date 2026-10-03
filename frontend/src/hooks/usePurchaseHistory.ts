import { useEffect, useRef, useState } from "react";

import type { Purchase } from "types/userIngredient";

import {
    useDeletePurchaseMutation,
    useGetPurchaseHistoryQuery,
    useUpdatePurchaseMutation,
} from "redux/services/userIngredientsApi";

import { ignoreRejection } from "utils/ignoreRejection";
import { withQuantity } from "utils/purchaseHistory";

export const usePurchaseHistory = (
    ingredientId: number,
    onEmptied: () => void,
) => {
    const query = useGetPurchaseHistoryQuery(ingredientId);
    const [updatePurchase] = useUpdatePurchaseMutation();
    const [deletePurchase] = useDeletePurchaseMutation();
    const [items, setItems] = useState<Purchase[]>([]);
    // what the server holds for each lot - the value a failed save rolls back to
    const savedQuantities = useRef(new Map<number, number>());
    // seed once - a later refetch must not overwrite unsaved edits in other rows
    const seeded = useRef(false);

    useEffect(() => {
        if (query.isSuccess && !seeded.current) {
            seeded.current = true;
            savedQuantities.current = new Map(
                query.data.map((purchase) => [purchase.id, purchase.quantity]),
            );
            setItems(query.data);
        }
    }, [query.isSuccess, query.data]);

    const changeQuantity = (id: number, quantity: number) => {
        setItems((prev) => withQuantity(prev, id, quantity));
    };

    const save = async (id: number, quantity: number) => {
        // a failed mutation is already toasted by the global listener
        const result = await updatePurchase({
            purchaseId: id,
            body: { quantity },
        });

        if ("data" in result) {
            savedQuantities.current.set(id, quantity);

            return;
        }

        const saved = savedQuantities.current.get(id) ?? null;

        if (saved !== null) {
            changeQuantity(id, saved);
        }
    };

    // the last lot takes the pantry item with it, so there is nothing left to show
    const remove = (id: number) => {
        deletePurchase(id)
            .unwrap()
            .then(() => {
                setItems((prev) =>
                    prev.filter((purchase) => purchase.id !== id),
                );
                savedQuantities.current.delete(id);

                if (savedQuantities.current.size === 0) {
                    onEmptied();
                }
            })
            .catch(ignoreRejection);
    };

    const isSettled = !query.isLoading && !query.isError;

    return {
        items,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        isEmpty: isSettled && items.length === 0,
        hasHistory: isSettled && items.length > 0,
        changeQuantity,
        save,
        remove,
    };
};
