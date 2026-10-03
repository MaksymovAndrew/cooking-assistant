import { ROUTES } from "constants/routes";

import { isActivePath } from "utils/isActivePath";

describe("isActivePath", () => {
    it("should be active on its own path", () => {
        expect(isActivePath(ROUTES.allRecipes, ROUTES.allRecipes)).toBe(true);
    });

    it("should stay active on its subpages", () => {
        expect(isActivePath("/profile", "/profile/settings")).toBe(true);
    });

    it("should not be active on a path that only shares its prefix", () => {
        expect(isActivePath("/menu", "/menus")).toBe(false);
    });

    it("should not be active elsewhere", () => {
        expect(isActivePath("/profile", ROUTES.allRecipes)).toBe(false);
    });
});
