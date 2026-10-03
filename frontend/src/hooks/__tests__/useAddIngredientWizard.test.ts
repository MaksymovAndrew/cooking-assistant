import { act, renderHook } from "@testing-library/react";

import type { Ingredient } from "types/ingredient";

import { useAddIngredientWizard } from "hooks/useAddIngredientWizard";

const ingredient = (id: number, slug: string): Ingredient => ({
    id,
    slug,
    name: slug,
    category: "vegetables",
    unit_name: "g",
    allergens: [],
    days_to_expire: null,
    calories_per_unit: null,
});

const CARROT = ingredient(1, "carrot");
const ONION = ingredient(2, "onion");
const LEEK = ingredient(3, "leek");
const CATALOG = [CARROT, ONION, LEEK];

const onConfirm = jest.fn();

const renderWizard = (selected: number[]) =>
    renderHook(() => useAddIngredientWizard(CATALOG, selected, onConfirm));

describe("useAddIngredientWizard", () => {
    it("should start on the pick step with the selected ingredients in catalog order", () => {
        const { result } = renderWizard([3, 1]);

        expect(result.current.step).toBe("pick");
        expect(result.current.newlySelected).toEqual([CARROT, LEEK]);
    });

    it("should walk the selected ingredients one at a time with a default quantity of 1", () => {
        const { result } = renderWizard([1, 2]);

        act(() => {
            result.current.startQuantities();
        });

        expect(result.current.step).toBe("quantities");
        expect(result.current.currentIngredient).toEqual(CARROT);
        expect(result.current.quantityOf(CARROT.id)).toBe(1);
        expect(result.current.isLastQuantityStep).toBe(false);

        act(() => {
            result.current.goNext();
        });

        expect(result.current.currentIngredient).toEqual(ONION);
        expect(result.current.isLastQuantityStep).toBe(true);
    });

    it("should confirm every quantity on the last step", () => {
        const { result } = renderWizard([1, 2]);

        act(() => {
            result.current.startQuantities();
        });
        act(() => {
            result.current.setQuantity(CARROT.id, 4);
        });
        act(() => {
            result.current.goNext();
        });
        act(() => {
            result.current.setQuantity(ONION.id, 250);
        });
        act(() => {
            result.current.goNext();
        });

        expect(onConfirm).toHaveBeenCalledWith({ 1: 4, 2: 250 });
    });

    it("should step back through the quantities and then to the picker", () => {
        const { result } = renderWizard([1, 2]);

        act(() => {
            result.current.startQuantities();
        });
        act(() => {
            result.current.goNext();
        });
        act(() => {
            result.current.goBack();
        });

        expect(result.current.currentIngredient).toEqual(CARROT);

        act(() => {
            result.current.goBack();
        });

        expect(result.current.step).toBe("pick");
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("should start the quantities over with defaults after going back to the picker", () => {
        const { result } = renderWizard([1]);

        act(() => {
            result.current.startQuantities();
        });
        act(() => {
            result.current.setQuantity(CARROT.id, 9);
        });
        act(() => {
            result.current.goBack();
        });
        act(() => {
            result.current.startQuantities();
        });

        expect(result.current.quantityOf(CARROT.id)).toBe(1);
    });
});
