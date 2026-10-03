import type { Purchase } from "types/userIngredient";

import { withQuantity } from "utils/purchaseHistory";

const LOT_A: Purchase = {
    id: 1,
    quantity: 500,
    purchase_date: "2025-01-01T00:00:00.000Z",
    unit_name: "g",
    days_to_expire: 365,
};
const LOT_B: Purchase = { ...LOT_A, id: 2, quantity: 200 };

describe("withQuantity", () => {
    it("should change only the lot with the given id", () => {
        expect(withQuantity([LOT_A, LOT_B], LOT_B.id, 50)).toEqual([
            LOT_A,
            { ...LOT_B, quantity: 50 },
        ]);
    });

    it("should leave the list as it was for an unknown id", () => {
        expect(withQuantity([LOT_A], 99, 50)).toEqual([LOT_A]);
    });
});
