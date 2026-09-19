import {
    resolveAllergen,
    resolveCategory,
    resolveIngredientName,
} from "utils/ingredientName";

describe("resolveIngredientName", () => {
    it("should return the catalog translation for a known slug", () => {
        expect(
            resolveIngredientName({ slug: "chicken_breast", name: "stale" }),
        ).toBe("Chicken breast");
    });

    it("should fall back to the given name when the slug is unknown", () => {
        expect(
            resolveIngredientName({ slug: "not_in_catalog", name: "Mystery" }),
        ).toBe("Mystery");
    });
});

describe("resolveCategory", () => {
    it("should return the catalog translation for a known category", () => {
        expect(resolveCategory("vegetables")).toBe("Vegetables");
    });

    it("should fall back to the raw key when the category is unknown", () => {
        expect(resolveCategory("not_a_category")).toBe("not_a_category");
    });
});

describe("resolveAllergen", () => {
    it("should return the catalog translation for a known allergen", () => {
        expect(resolveAllergen("gluten")).toBe("Gluten");
    });

    it("should fall back to the raw slug when the allergen is unknown", () => {
        expect(resolveAllergen("not_an_allergen")).toBe("not_an_allergen");
    });
});
