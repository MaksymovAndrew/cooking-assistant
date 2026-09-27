import i18next from "i18next";

import {
    resolveAllergen,
    resolveCategory,
    resolveIngredientName,
} from "utils/ingredientName";

const t = i18next.getFixedT("en");

describe("resolveIngredientName", () => {
    it("should return the catalog translation for a known slug", () => {
        expect(
            resolveIngredientName(t, { slug: "chicken_breast", name: "stale" }),
        ).toBe("Chicken breast");
    });

    it("should fall back to the given name when the slug is unknown", () => {
        expect(
            resolveIngredientName(t, {
                slug: "not_in_catalog",
                name: "Mystery",
            }),
        ).toBe("Mystery");
    });
});

describe("resolveCategory", () => {
    it("should return the catalog translation for a known category", () => {
        expect(resolveCategory(t, "vegetables")).toBe("Vegetables");
    });

    it("should fall back to the raw key when the category is unknown", () => {
        expect(resolveCategory(t, "not_a_category")).toBe("not_a_category");
    });
});

describe("resolveAllergen", () => {
    it("should return the catalog translation for a known allergen", () => {
        expect(resolveAllergen(t, "gluten")).toBe("Gluten");
    });

    it("should fall back to the raw slug when the allergen is unknown", () => {
        expect(resolveAllergen(t, "not_an_allergen")).toBe("not_an_allergen");
    });
});
