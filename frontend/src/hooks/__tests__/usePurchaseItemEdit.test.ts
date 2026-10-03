import { act, renderHook } from "@testing-library/react";

import type { Purchase } from "types/userIngredient";

import { usePurchaseItemEdit } from "hooks/usePurchaseItemEdit";

const PURCHASE: Purchase = {
    id: 1,
    quantity: 500,
    purchase_date: "2025-01-01T00:00:00.000Z",
    unit_name: "g",
    days_to_expire: 365,
};

const renderEdit = () => {
    const onSave = jest.fn(() => Promise.resolve());
    const view = renderHook(() =>
        usePurchaseItemEdit(PURCHASE, jest.fn(), onSave),
    );

    return { ...view, onSave };
};

describe("usePurchaseItemEdit", () => {
    it("should save only once when an edit is finished twice", () => {
        const { result, onSave } = renderEdit();

        act(() => {
            result.current.startEditing();
        });
        act(() => {
            result.current.finishEditing();
            result.current.finishEditing();
        });

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith(PURCHASE.id, PURCHASE.quantity);
        expect(result.current.isEditing).toBe(false);
    });

    it("should not save when nothing was being edited", () => {
        const { result, onSave } = renderEdit();

        act(() => {
            result.current.finishEditing();
        });

        expect(onSave).not.toHaveBeenCalled();
    });
});
