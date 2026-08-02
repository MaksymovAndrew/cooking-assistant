import request from "supertest";

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "constants/errorMessages";

import { authCookie, buildTestApp } from "test/helpers/testApp";

const INTAKE_PATH = "/api/calorie-intake";
const GOAL_PATH = "/api/calorie-goal";
const EATEN_AT = "2026-01-01T00:00:00.000Z";

describe("calorie routes", () => {
    it("should return 401 without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get(INTAKE_PATH);

        expect(res.status).toBe(401);
    });

    it("should return the intake log for the requested range", async () => {
        const { app, deps } = buildTestApp();
        const entries = [
            {
                id: 1,
                person_id: 7,
                recipe_id: 5,
                menu_id: null,
                title: "Soup",
                portions: 2,
                calories: 44,
                eaten_at: EATEN_AT,
            },
        ];

        deps.calorieRepository.findIntake.mockResolvedValue(entries);

        const res = await request(app)
            .get(INTAKE_PATH)
            .query({
                from: EATEN_AT,
                to: "2026-01-31T23:59:59.999Z",
            })
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual(entries);
        expect(deps.calorieRepository.findIntake).toHaveBeenCalledWith(
            7,
            EATEN_AT,
            "2026-01-31T23:59:59.999Z",
        );
    });

    it("should log intake for a recipe, computing calories server-side", async () => {
        const { app, deps } = buildTestApp();

        deps.calorieRepository.findRecipeCalories.mockResolvedValue({
            title: "Soup",
            calories: 21.6,
        });
        deps.calorieRepository.logIntake.mockResolvedValue({
            id: 1,
            person_id: 7,
            recipe_id: 5,
            menu_id: null,
            title: "Soup",
            portions: 2,
            calories: 44,
            eaten_at: "2026-01-01T00:00:00.000Z",
        });

        const res = await request(app)
            .post(INTAKE_PATH)
            .set("Cookie", authCookie(7))
            .send({ recipe_id: 5, portions: 2, calories: 999 });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(
            expect.objectContaining({ title: "Soup", calories: 44 }),
        );
        expect(deps.calorieRepository.logIntake).toHaveBeenCalledWith(7, {
            recipe_id: 5,
            menu_id: undefined,
            title: "Soup",
            portions: 2,
            calories: 44,
        });
    });

    it("should map a missing recipe to a 404 response", async () => {
        const { app, deps } = buildTestApp();

        deps.calorieRepository.findRecipeCalories.mockResolvedValue(null);

        const res = await request(app)
            .post(INTAKE_PATH)
            .set("Cookie", authCookie(7))
            .send({ recipe_id: 999, portions: 1 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.RECIPE_NOT_FOUND });
    });

    it("should delete an intake entry", async () => {
        const { app, deps } = buildTestApp();

        deps.calorieRepository.deleteIntake.mockResolvedValue(true);

        const res = await request(app)
            .delete(`${INTAKE_PATH}/11`)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: SUCCESS_MESSAGES.INTAKE_DELETED });
        expect(deps.calorieRepository.deleteIntake).toHaveBeenCalledWith(7, 11);
    });

    it("should map a missing intake entry to a 404 response", async () => {
        const { app, deps } = buildTestApp();

        deps.calorieRepository.deleteIntake.mockResolvedValue(false);

        const res = await request(app)
            .delete(`${INTAKE_PATH}/99`)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.INTAKE_NOT_FOUND });
    });

    it("should update the calorie goal", async () => {
        const { app, deps } = buildTestApp();

        deps.calorieRepository.updateGoal.mockResolvedValue(undefined);

        const res = await request(app)
            .put(GOAL_PATH)
            .set("Cookie", authCookie(7))
            .send({
                calorie_goal: 2000,
                meal_calorie_limit: 800,
            });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.CALORIE_GOAL_UPDATED,
        });
        expect(deps.calorieRepository.updateGoal).toHaveBeenCalledWith(7, {
            calorie_goal: 2000,
            meal_calorie_limit: 800,
        });
    });
});
