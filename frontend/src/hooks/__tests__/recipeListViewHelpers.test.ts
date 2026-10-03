import {
    hasViewerOnlyFilter,
    isPantryFilterEmpty,
    isRecipeListEmpty,
} from "hooks/recipeListViewHelpers";

const NO_VIEWER_FILTERS = { favourites: false, hideAvoided: false, tags: [] };

describe("isPantryFilterEmpty", () => {
    it("should be true once a loaded pantry turns out empty under the pantry filter", () => {
        expect(isPantryFilterEmpty(true, 0, false, false)).toBe(true);
    });

    it("should be false while the pantry is still loading or not yet asked for", () => {
        expect(isPantryFilterEmpty(true, 0, true, false)).toBe(false);
        expect(isPantryFilterEmpty(true, 0, false, true)).toBe(false);
    });

    it("should be false when the pantry holds something", () => {
        expect(isPantryFilterEmpty(true, 3, false, false)).toBe(false);
    });

    it("should be false without the pantry filter", () => {
        expect(isPantryFilterEmpty(false, 0, false, false)).toBe(false);
    });
});

describe("isRecipeListEmpty", () => {
    it("should be empty when the pantry filter has nothing to search", () => {
        expect(isRecipeListEmpty(true, false, false)).toBe(true);
    });

    it("should be empty when a successful request found no recipes", () => {
        expect(isRecipeListEmpty(false, true, false)).toBe(true);
    });

    it("should not be empty before the request has succeeded", () => {
        expect(isRecipeListEmpty(false, false, false)).toBe(false);
    });

    it("should not be empty when recipes were found", () => {
        expect(isRecipeListEmpty(false, true, true)).toBe(false);
    });
});

describe("hasViewerOnlyFilter", () => {
    it("should be false when only public filters are set", () => {
        expect(hasViewerOnlyFilter(NO_VIEWER_FILTERS)).toBe(false);
    });

    it.each([
        { ...NO_VIEWER_FILTERS, favourites: true },
        { ...NO_VIEWER_FILTERS, hideAvoided: true },
        { ...NO_VIEWER_FILTERS, tags: [4] },
    ])(
        "should be true when a filter needing a session is set: %j",
        (filters) => {
            expect(hasViewerOnlyFilter(filters)).toBe(true);
        },
    );
});
