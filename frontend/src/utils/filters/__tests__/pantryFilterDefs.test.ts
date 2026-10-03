import i18next from "i18next";

import type { PantryIngredient, PantryLot } from "types/userIngredient";

import { isUrgent, pantryFilterDefs } from "utils/filters/pantryFilterDefs";

const NOW = new Date("2026-07-10T12:00:00.000Z").getTime();
const t = i18next.getFixedT("en", "ingredients");

const lotBoughtOn = (purchaseDate: string): PantryLot => ({
    id: 1,
    quantity: 1,
    purchase_date: purchaseDate,
});

const SALMON: PantryIngredient = {
    id: 1,
    slug: "salmon",
    ingredient_name: "Salmon",
    category: "fish",
    unit_name: "g",
    quantity_person_ingradient: 300,
    days_to_expire: 3,
    allergens: ["fish"],
    lots: [lotBoughtOn("2026-07-09T00:00:00.000Z")],
};
const CARROT: PantryIngredient = {
    id: 2,
    slug: "carrot",
    ingredient_name: "Carrot",
    category: "vegetables",
    unit_name: "g",
    quantity_person_ingradient: 500,
    days_to_expire: 30,
    allergens: [],
    lots: [lotBoughtOn("2026-07-09T00:00:00.000Z")],
};

const [queryDef, categoryDef, expiringSoonDef] = pantryFilterDefs(t);

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.useRealTimers();
});

describe("isUrgent", () => {
    it("should flag an ingredient that expires within a few days", () => {
        expect(isUrgent(3, SALMON.lots)).toBe(true);
    });

    it("should flag an ingredient that has already expired", () => {
        expect(isUrgent(1, [lotBoughtOn("2026-07-01T00:00:00.000Z")])).toBe(
            true,
        );
    });

    it("should not flag an ingredient with plenty of time left", () => {
        expect(isUrgent(30, CARROT.lots)).toBe(false);
    });

    it("should not flag an ingredient without expiry data", () => {
        expect(isUrgent(null, SALMON.lots)).toBe(false);
        expect(isUrgent(3, [])).toBe(false);
    });
});

describe("pantryFilterDefs", () => {
    it("should match the query against the name the viewer reads", () => {
        expect(queryDef.predicate(SALMON, "FILLET")).toBe(true);
        expect(queryDef.predicate(CARROT, "fillet")).toBe(false);
    });

    it("should ignore whitespace around the query", () => {
        expect(queryDef.predicate(CARROT, "  carr ")).toBe(true);
    });

    it("should keep only the picked category", () => {
        expect(categoryDef.predicate(SALMON, "fish")).toBe(true);
        expect(categoryDef.predicate(CARROT, "fish")).toBe(false);
    });

    it("should keep only urgent ingredients when expiring soon is on", () => {
        expect(expiringSoonDef.predicate(SALMON, true)).toBe(true);
        expect(expiringSoonDef.predicate(CARROT, true)).toBe(false);
    });

    it("should be inactive at each default value", () => {
        expect(queryDef.isActive(queryDef.defaultValue)).toBe(false);
        expect(categoryDef.isActive(categoryDef.defaultValue)).toBe(false);
        expect(expiringSoonDef.isActive(expiringSoonDef.defaultValue)).toBe(
            false,
        );
    });
});
