import type { ShoppingListItem } from "types/shoppingList";

import {
    useAddShoppingListItemMutation,
    useClearCheckedShoppingListItemsMutation,
    useDeleteShoppingListItemMutation,
    useGetShoppingListQuery,
    useReorderShoppingListMutation,
    useSetShoppingListItemCheckedMutation,
} from "redux/services/shoppingListApi";

export type MoveDirection = -1 | 1;

const NO_ITEMS: ShoppingListItem[] = [];

// failures surface through the global error toast, so the handlers only swallow the rejected promise
const ignoreRejection = () => undefined;

export const useShoppingList = () => {
    const {
        data: items = NO_ITEMS,
        isLoading,
        isError,
        refetch,
    } = useGetShoppingListQuery(null);
    const [addItem, addState] = useAddShoppingListItemMutation();
    const [setChecked] = useSetShoppingListItemCheckedMutation();
    const [deleteItem] = useDeleteShoppingListItemMutation();
    const [clearChecked, clearState] =
        useClearCheckedShoppingListItemsMutation();
    const [reorder] = useReorderShoppingListMutation();

    const toBuy = items.filter((item) => !item.checked);
    const bought = items.filter((item) => item.checked);

    // resolves true once the item is saved, so the form knows to clear itself
    const add = async (name: string, note: string): Promise<boolean> => {
        try {
            await addItem({
                name: name.trim(),
                note: note.trim() === "" ? null : note.trim(),
            }).unwrap();

            return true;
        } catch {
            return false;
        }
    };

    const toggle = (item: ShoppingListItem) => {
        setChecked({ id: item.id, checked: !item.checked })
            .unwrap()
            .catch(ignoreRejection);
    };

    const remove = (item: ShoppingListItem) => {
        deleteItem(item.id).unwrap().catch(ignoreRejection);
    };

    const clearBought = () => {
        clearChecked(null).unwrap().catch(ignoreRejection);
    };

    // bought items keep their places after the ones still to buy, so the server gets the whole list back
    const move = (item: ShoppingListItem, direction: MoveDirection) => {
        const from = toBuy.findIndex((entry) => entry.id === item.id);
        const to = from + direction;
        const isOutOfRange = from === -1 || to < 0 || to >= toBuy.length;

        if (isOutOfRange) {
            return;
        }

        const reordered = [...toBuy];

        [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
        reorder({ ids: [...reordered, ...bought].map((entry) => entry.id) })
            .unwrap()
            .catch(ignoreRejection);
    };

    return {
        toBuy,
        bought,
        total: items.length,
        // changes whenever an item moves, is ticked, added or removed - the cue to animate the layout
        layoutKey: [...toBuy, ...bought]
            .map((entry) => `${entry.id}:${entry.checked}`)
            .join(","),
        isEmpty: items.length === 0,
        isLoading,
        isError,
        retry: () => {
            refetch().catch(ignoreRejection);
        },
        add,
        isAdding: addState.isLoading,
        toggle,
        remove,
        move,
        clearBought,
        isClearing: clearState.isLoading,
    };
};
