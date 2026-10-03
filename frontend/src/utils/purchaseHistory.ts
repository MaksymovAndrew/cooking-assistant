import type { Purchase } from "types/userIngredient";

export const withQuantity = (
    purchases: readonly Purchase[],
    id: number,
    quantity: number,
): Purchase[] =>
    purchases.map((purchase) =>
        purchase.id === id ? { ...purchase, quantity } : purchase,
    );
