import { useMemo, useState } from "react";

import type { Ingredient } from "types/ingredient";

const DEFAULT_QUANTITY = 1;

// pick the ingredients first, then walk them one at a time to set quantities
export const useAddIngredientWizard = (
    allIngredients: Ingredient[],
    selectedIngredients: number[],
    onConfirm: (quantities: Record<number, number>) => void,
) => {
    const [step, setStep] = useState<"pick" | "quantities">("pick");
    const [quantityIndex, setQuantityIndex] = useState(0);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    const selectedIds = useMemo(
        () => new Set(selectedIngredients),
        [selectedIngredients],
    );
    const newlySelected = useMemo(
        () =>
            allIngredients.filter((ingredient) =>
                selectedIds.has(ingredient.id),
            ),
        [allIngredients, selectedIds],
    );

    const startQuantities = () => {
        setQuantities(
            Object.fromEntries(
                newlySelected.map((ingredient) => [
                    ingredient.id,
                    DEFAULT_QUANTITY,
                ]),
            ),
        );
        setQuantityIndex(0);
        setStep("quantities");
    };

    const goBack = () => {
        if (quantityIndex === 0) {
            setStep("pick");

            return;
        }

        setQuantityIndex((prev) => prev - 1);
    };

    const isLastQuantityStep = quantityIndex === newlySelected.length - 1;

    const goNext = () => {
        if (isLastQuantityStep) {
            onConfirm(quantities);

            return;
        }

        setQuantityIndex((prev) => prev + 1);
    };

    const currentIngredient =
        quantityIndex < newlySelected.length
            ? newlySelected[quantityIndex]
            : undefined;

    const setQuantity = (id: number, quantity: number) => {
        setQuantities((prev) => ({ ...prev, [id]: quantity }));
    };

    return {
        step,
        newlySelected,
        currentIngredient,
        quantityIndex,
        quantityOf: (id: number) => quantities[id] ?? DEFAULT_QUANTITY,
        isLastQuantityStep,
        startQuantities,
        goBack,
        goNext,
        setQuantity,
    };
};
