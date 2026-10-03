import { pageAlternates } from "utils/pageAlternates";

const RECIPE_PATH = "/recipe/7";

describe("pageAlternates", () => {
    it("should point the canonical at the page in its own language", () => {
        expect(pageAlternates(RECIPE_PATH, "uk").canonical).toBe(
            "/uk/recipe/7",
        );
    });

    it("should keep the bare path as the English canonical", () => {
        expect(pageAlternates(RECIPE_PATH, "en").canonical).toBe(RECIPE_PATH);
    });

    it("should list every language with the bare path as the default", () => {
        expect(pageAlternates(RECIPE_PATH, "pl").languages).toEqual({
            en: RECIPE_PATH,
            pl: "/pl/recipe/7",
            ru: "/ru/recipe/7",
            uk: "/uk/recipe/7",
            "x-default": RECIPE_PATH,
        });
    });
});
