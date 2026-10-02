import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";
import { FIELD_LIMITS } from "constants/fieldLimits";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

// input the API must turn away as a 400 before it can reach the database and come back as a 500
describe("malformed input", () => {
    it("should answer a pantry update sent without a body with a 400", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .put("/api/user-ingredients")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: "Required",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
        expect(deps.pantryRepository.addIngredients).not.toHaveBeenCalled();
    });

    it("should answer an id past the database integer range with a 400", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app).get(
            `/api/recipe/${FIELD_LIMITS.INT4_MAX + 1}`,
        );

        expect(res.status).toBe(400);
        expect(
            deps.recipeRepository.findByIdWithIngredients,
        ).not.toHaveBeenCalled();
    });

    it("should answer an id list past the database integer range with a 400", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app).get(
            `/api/recipes-by-filters?type_ids=1,${FIELD_LIMITS.INT4_MAX + 1}`,
        );

        expect(res.status).toBe(400);
        expect(deps.recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should answer a title longer than its column with a 400", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .post("/api/recipe")
            .set("Cookie", authCookie(7))
            .send({
                title: "a".repeat(FIELD_LIMITS.RECIPE_TITLE_LENGTH + 1),
                content: "Boil it",
                language: "en",
                ingredients: [{ id: 3, quantity: 1 }],
            });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: `title: Must be at most ${FIELD_LIMITS.RECIPE_TITLE_LENGTH} characters`,
            code: ERROR_CODES.VALIDATION_ERROR,
        });
        expect(deps.recipeRepository.create).not.toHaveBeenCalled();
    });

    it("should answer broken JSON with the bad_request copy, not the parser's message", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .post("/api/login")
            .set("Content-Type", "application/json")
            .send("{ not json");

        expect(res.status).toBe(400);
        expect(res.body).toEqual(errorBody(ERROR_CODES.BAD_REQUEST));
    });

    it("should spell the validation error in the language the request asks for", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .put("/api/user-ingredients")
            .set("Cookie", authCookie(7))
            .set("Accept-Language", "pl");

        expect(res.body).toEqual({
            error: "Pole wymagane",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
    });
});
