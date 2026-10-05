import i18next from "i18next";

import { ingredientSummary } from "utils/ingredientSummary";

const t = i18next.getFixedT("en", "ingredients");

describe("ingredientSummary", () => {
    it("should name the category and how long the product keeps", () => {
        expect(
            ingredientSummary(t, {
                category: "vegetables",
                days_to_expire: 30,
            }),
        ).toBe("Vegetables · Shelf life: 30 days");
    });

    it("should say one day, not one days", () => {
        expect(
            ingredientSummary(t, { category: "vegetables", days_to_expire: 1 }),
        ).toBe("Vegetables · Shelf life: 1 day");
    });

    it("should name only the category for a product that does not spoil", () => {
        expect(
            ingredientSummary(t, {
                category: "vegetables",
                days_to_expire: null,
            }),
        ).toBe("Vegetables");
    });
});
