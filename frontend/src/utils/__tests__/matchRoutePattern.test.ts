import { matchRoutePattern } from "utils/matchRoutePattern";

const RECIPE_PATTERN = "/recipe/:id";

describe("matchRoutePattern", () => {
    it("should match a literal path", () => {
        expect(matchRoutePattern("/login", "/login")).toBe(true);
    });

    it("should match any value in a dynamic segment", () => {
        expect(matchRoutePattern(RECIPE_PATTERN, "/recipe/42")).toBe(true);
    });

    it("should not match a different literal segment", () => {
        expect(matchRoutePattern(RECIPE_PATTERN, "/menu/42")).toBe(false);
    });

    it("should not match a path with more segments", () => {
        expect(matchRoutePattern(RECIPE_PATTERN, "/recipe/42/edit")).toBe(
            false,
        );
    });

    it("should not match a path with fewer segments", () => {
        expect(matchRoutePattern(RECIPE_PATTERN, "/recipe")).toBe(false);
    });
});
