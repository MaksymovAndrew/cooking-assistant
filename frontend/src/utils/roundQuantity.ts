const QUANTITY_DECIMALS = 2;

// scaled and summed amounts arrive as long fractions, so two decimals are enough to cook and shop by
export const roundQuantity = (quantity: number): number =>
    Number(quantity.toFixed(QUANTITY_DECIMALS));
