import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";
import type { DietPreferences } from "domain/repositories/DietPreferencesRepository";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

const DIET_PREFERENCES_PATH = "/api/diet-preferences";
const GLUTEN_PATH = "/api/diet-preferences/allergens/gluten";

describe("diet preferences routes", () => {
    it("should return 401 without a session", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app).get(DIET_PREFERENCES_PATH);

        expect(res.status).toBe(401);
        expect(res.body).toEqual(errorBody(ERROR_CODES.SESSION_EXPIRED));
        expect(
            deps.dietPreferencesRepository.findByPerson,
        ).not.toHaveBeenCalled();
    });

    it("should return what the signed-in user avoids", async () => {
        const { app, deps } = buildTestApp();
        const preferences: DietPreferences = {
            allergens: ["milk"],
            ingredient_ids: [3],
        };

        deps.dietPreferencesRepository.findByPerson.mockResolvedValue(
            preferences,
        );

        const res = await request(app)
            .get(DIET_PREFERENCES_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual(preferences);
        expect(
            deps.dietPreferencesRepository.findByPerson,
        ).toHaveBeenCalledWith(7);
    });

    it("should add and remove an avoided allergen with a 204", async () => {
        const { app, deps } = buildTestApp();

        deps.dietPreferencesRepository.addAllergen.mockResolvedValue(true);

        const added = await request(app)
            .put(GLUTEN_PATH)
            .set("Cookie", authCookie(7));
        const removed = await request(app)
            .delete(GLUTEN_PATH)
            .set("Cookie", authCookie(7));

        expect(added.status).toBe(204);
        expect(removed.status).toBe(204);
        expect(deps.dietPreferencesRepository.addAllergen).toHaveBeenCalledWith(
            7,
            "gluten",
        );
        expect(
            deps.dietPreferencesRepository.removeAllergen,
        ).toHaveBeenCalledWith(7, "gluten");
    });

    it("should reject an unknown allergen with a 400", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .put("/api/diet-preferences/allergens/chocolate")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: "Unknown allergen",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
        expect(
            deps.dietPreferencesRepository.addAllergen,
        ).not.toHaveBeenCalled();
    });

    it("should add and remove an avoided ingredient with a 204", async () => {
        const { app, deps } = buildTestApp();

        deps.dietPreferencesRepository.addIngredient.mockResolvedValue("added");

        const added = await request(app)
            .put("/api/ingredient/12/avoid")
            .set("Cookie", authCookie(7));
        const removed = await request(app)
            .delete("/api/ingredient/12/avoid")
            .set("Cookie", authCookie(7));

        expect(added.status).toBe(204);
        expect(removed.status).toBe(204);
        expect(
            deps.dietPreferencesRepository.addIngredient,
        ).toHaveBeenCalledWith(7, 12);
        expect(
            deps.dietPreferencesRepository.removeIngredient,
        ).toHaveBeenCalledWith(7, 12);
    });

    it("should map a missing ingredient to a 404 response", async () => {
        const { app, deps } = buildTestApp();

        deps.dietPreferencesRepository.addIngredient.mockResolvedValue(
            "ingredient_not_found",
        );

        const res = await request(app)
            .put("/api/ingredient/999/avoid")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.INGREDIENT_NOT_FOUND));
    });

    it("should reject hiding avoided recipes for a guest but let a guest exclude allergens", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.search.mockResolvedValue({ items: [], total: 0 });

        const hidden = await request(app).get(
            "/api/recipes-by-filters?hide_avoided=true",
        );
        const excluded = await request(app).get(
            "/api/recipes-by-filters?exclude_allergens=gluten,milk",
        );

        expect(hidden.status).toBe(400);
        expect(hidden.body).toEqual(errorBody(ERROR_CODES.DIET_REQUIRES_LOGIN));
        expect(excluded.status).toBe(200);
        expect(deps.recipeRepository.search).toHaveBeenCalledWith(null, {
            exclude_allergens: ["gluten", "milk"],
        });
    });
});
