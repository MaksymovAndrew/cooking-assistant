import i18next from "i18next";

import {
    menuCategoryName,
    quantityWithUnit,
    recipeTypeDescription,
    recipeTypeName,
    unitName,
} from "utils/referenceLabels";

const t = i18next.getFixedT("en");
const UNKNOWN_TYPE = "Brunch special";
const STORED_DESCRIPTION = "stored description";

describe("recipeTypeName", () => {
    it("should find a type by its stored English name", () => {
        expect(recipeTypeName(t, "Main course")).toBe("Main course");
    });

    it("should fall back to the stored name for a type it does not know", () => {
        expect(recipeTypeName(t, UNKNOWN_TYPE)).toBe(UNKNOWN_TYPE);
    });
});

describe("recipeTypeDescription", () => {
    it("should use the app's own copy instead of the stored description", () => {
        expect(
            recipeTypeDescription(t, "First course", STORED_DESCRIPTION),
        ).toBe(
            "Soups, broths and light starters — they warm you up and wake up the appetite.",
        );
    });

    it("should fall back to the stored description for an unknown type", () => {
        expect(recipeTypeDescription(t, UNKNOWN_TYPE, STORED_DESCRIPTION)).toBe(
            STORED_DESCRIPTION,
        );
    });
});

describe("menuCategoryName", () => {
    it("should find a category by its stored English name", () => {
        expect(menuCategoryName(t, "Dinner")).toBe("Dinner");
    });

    it("should fall back to the stored name for a category it does not know", () => {
        expect(menuCategoryName(t, "Supper")).toBe("Supper");
    });
});

describe("unitName", () => {
    it("should keep the capital letter of a unit whose key is lowercase", () => {
        expect(unitName(t, "L")).toBe("L");
    });

    it("should fall back to the stored unit it does not know", () => {
        expect(unitName(t, "pinch")).toBe("pinch");
    });

    it("should agree with the count it is given", () => {
        expect(unitName(t, "clove", 1)).toBe("clove");
        expect(unitName(t, "clove", 3)).toBe("cloves");
    });

    it("should leave a unit of measure alone whatever the count", () => {
        expect(unitName(t, "kg", 3)).toBe("kg");
    });
});

describe("quantityWithUnit", () => {
    it("should round the amount and make the unit agree with it", () => {
        expect(quantityWithUnit(t, "en", 1.0004, "slice")).toBe("1 slice");
        expect(quantityWithUnit(t, "en", 2.5, "slice")).toBe("2.5 slices");
    });
});
