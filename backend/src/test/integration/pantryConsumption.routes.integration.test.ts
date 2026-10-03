import request from "supertest";

import { COOKING_UNDO_WINDOW_MS } from "constants/cooking";
import { ERROR_CODES } from "constants/errorCodes";
import { DEFAULT_LOCALE } from "constants/locales";
import { translateMessage } from "i18n/translate";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

const COOK_PATH = "/api/user-ingredients/cook";
const UNDO_PATH = "/api/user-ingredients/cook/42/undo";

describe("pantry consumption routes", () => {
    it("should return 401 without a token", async () => {
        const { app } = buildTestApp();

        const cook = await request(app)
            .post(COOK_PATH)
            .send({ recipe_id: 5, portions: 1 });
        const undo = await request(app).post(UNDO_PATH);

        expect(cook.status).toBe(401);
        expect(undo.status).toBe(401);
    });

    it("should cook a recipe for the signed-in user and answer with what was used", async () => {
        const { app, deps } = buildTestApp();

        deps.calorieRepository.findRecipeCalories.mockResolvedValue({
            title: "Soup",
            calories: 120,
        });
        deps.pantryConsumptionRepository.findRequirements.mockResolvedValue([
            {
                ingredient_id: 3,
                slug: "carrot",
                name: "Carrot",
                unit_name: "g",
                quantity: 100,
            },
        ]);
        deps.pantryConsumptionRepository.cook.mockResolvedValue({
            consumptionId: 42,
            taken: [{ ingredient_id: 3, quantity: 200 }],
            calorieIntake: null,
        });

        const res = await request(app)
            .post(COOK_PATH)
            .set("Cookie", authCookie(7))
            .send({ recipe_id: 5, portions: 2 });

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            consumptionId: 42,
            deducted: [
                {
                    ingredient_id: 3,
                    slug: "carrot",
                    name: "Carrot",
                    unit_name: "g",
                    needed: 200,
                    quantity: 200,
                },
            ],
            skipped: [],
            calorieIntake: null,
        });
        expect(deps.pantryConsumptionRepository.cook).toHaveBeenCalledWith(
            7,
            expect.objectContaining({ source: { recipeId: 5 }, portions: 2 }),
        );
    });

    it("should answer 400 for an invalid body without touching the pantry", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .post(COOK_PATH)
            .set("Cookie", authCookie(7))
            .send({ recipe_id: 5, menu_id: 9, portions: 1 });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: "recipe_id: Provide either a recipe or a menu, not both",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
        expect(deps.pantryConsumptionRepository.cook).not.toHaveBeenCalled();
    });

    it("should answer 404 for a recipe that does not exist", async () => {
        const { app, deps } = buildTestApp();

        deps.calorieRepository.findRecipeCalories.mockResolvedValue(null);

        const res = await request(app)
            .post(COOK_PATH)
            .set("Cookie", authCookie(7))
            .send({ recipe_id: 5, portions: 1 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.RECIPE_NOT_FOUND));
    });

    it("should undo a cooking and confirm it", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryConsumptionRepository.undo.mockResolvedValue("undone");

        const res = await request(app)
            .post(UNDO_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: translateMessage("cookingUndone", DEFAULT_LOCALE),
        });
        expect(deps.pantryConsumptionRepository.undo).toHaveBeenCalledWith(
            7,
            42,
            COOKING_UNDO_WINDOW_MS,
        );
    });

    it("should answer 409 when the cooking can no longer be undone", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryConsumptionRepository.undo.mockResolvedValue("unavailable");

        const res = await request(app)
            .post(UNDO_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(409);
        expect(res.body).toEqual(errorBody(ERROR_CODES.UNDO_EXPIRED));
    });

    it("should answer 404 for a cooking record that is not the user's", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryConsumptionRepository.undo.mockResolvedValue("not_found");

        const res = await request(app)
            .post(UNDO_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.CONSUMPTION_NOT_FOUND));
    });
});
