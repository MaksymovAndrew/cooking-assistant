import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

const RECIPE_5_FAVOURITE_PATH = "/api/recipe/5/favourite";

describe("favourite routes", () => {
    it("should return 401 without a session", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app).put(RECIPE_5_FAVOURITE_PATH);

        expect(res.status).toBe(401);
        expect(res.body).toEqual(errorBody(ERROR_CODES.SESSION_EXPIRED));
        expect(deps.favouriteRepository.add).not.toHaveBeenCalled();
    });

    it("should favourite a recipe for the signed-in user with a 204", async () => {
        const { app, deps } = buildTestApp();

        deps.favouriteRepository.add.mockResolvedValue(true);

        const res = await request(app)
            .put(RECIPE_5_FAVOURITE_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(204);
        expect(deps.favouriteRepository.add).toHaveBeenCalledWith(
            7,
            "recipe",
            5,
        );
    });

    it("should map a missing recipe to a 404 response", async () => {
        const { app, deps } = buildTestApp();

        deps.favouriteRepository.add.mockResolvedValue(false);

        const res = await request(app)
            .put("/api/recipe/999/favourite")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.RECIPE_NOT_FOUND));
    });

    it("should unfavourite a recipe with a 204", async () => {
        const { app, deps } = buildTestApp();

        deps.favouriteRepository.remove.mockResolvedValue(undefined);

        const res = await request(app)
            .delete(RECIPE_5_FAVOURITE_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(204);
        expect(deps.favouriteRepository.remove).toHaveBeenCalledWith(
            7,
            "recipe",
            5,
        );
    });

    it("should favourite and unfavourite a menu", async () => {
        const { app, deps } = buildTestApp();

        deps.favouriteRepository.add.mockResolvedValue(true);
        deps.favouriteRepository.remove.mockResolvedValue(undefined);

        const added = await request(app)
            .put("/api/menu/9/favourite")
            .set("Cookie", authCookie(7));
        const removed = await request(app)
            .delete("/api/menu/9/favourite")
            .set("Cookie", authCookie(7));

        expect(added.status).toBe(204);
        expect(removed.status).toBe(204);
        expect(deps.favouriteRepository.add).toHaveBeenCalledWith(7, "menu", 9);
        expect(deps.favouriteRepository.remove).toHaveBeenCalledWith(
            7,
            "menu",
            9,
        );
    });

    it("should map a missing menu to a 404 response", async () => {
        const { app, deps } = buildTestApp();

        deps.favouriteRepository.add.mockResolvedValue(false);

        const res = await request(app)
            .put("/api/menu/999/favourite")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.MENU_NOT_FOUND));
    });

    it("should reject a non-numeric id with a 400", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .put("/api/recipe/abc/favourite")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: "ID must be a number",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
        expect(deps.favouriteRepository.add).not.toHaveBeenCalled();
    });

    it("should reject the favourites filter for a guest", async () => {
        const { app, deps } = buildTestApp();

        const recipes = await request(app).get(
            "/api/recipes-by-filters?favourites=true",
        );
        const menus = await request(app).get("/api/menu?favourites=true");

        expect(recipes.status).toBe(400);
        expect(recipes.body).toEqual(
            errorBody(ERROR_CODES.FAVOURITES_REQUIRES_LOGIN),
        );
        expect(menus.status).toBe(400);
        expect(menus.body).toEqual(
            errorBody(ERROR_CODES.FAVOURITES_REQUIRES_LOGIN),
        );
        expect(deps.recipeRepository.search).not.toHaveBeenCalled();
        expect(deps.menuRepository.findAll).not.toHaveBeenCalled();
    });
});
