import request from "supertest";

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "constants/errorMessages";

import { authCookie, buildTestApp } from "test/helpers/testApp";

const USER_INGREDIENTS_PATH = "/api/user-ingredients";

describe("user ingredient routes", () => {
    it("should return 401 without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get(USER_INGREDIENTS_PATH);

        expect(res.status).toBe(401);
    });

    it("should return user ingredients for the authenticated user", async () => {
        const { app, deps } = buildTestApp();
        const ingredients = [{ ingredient_id: 3, ingredient_name: "tomato" }];

        deps.pantryRepository.findByUser.mockResolvedValue(ingredients);

        const res = await request(app)
            .get(USER_INGREDIENTS_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual(ingredients);
        expect(deps.pantryRepository.findByUser).toHaveBeenCalledWith(7);
    });

    it("should update user ingredients", async () => {
        const { app, deps } = buildTestApp();

        deps.ingredientRepository.findExistingIds.mockResolvedValue([3]);
        deps.pantryRepository.addIngredients.mockResolvedValue(undefined);

        const res = await request(app)
            .put(USER_INGREDIENTS_PATH)
            .set("Cookie", authCookie(7))
            .send({ ingredients: [{ id: 3, quantity_person_ingradient: 2 }] });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.INGREDIENTS_UPDATED,
        });
        expect(deps.pantryRepository.addIngredients).toHaveBeenCalledWith(7, [
            { id: 3, quantity_person_ingradient: 2 },
        ]);
    });

    it("should delete a user ingredient", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryRepository.deleteIngredient.mockResolvedValue(true);

        const res = await request(app)
            .delete("/api/user-ingredients/3")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.INGREDIENT_DELETED,
        });
        expect(deps.pantryRepository.deleteIngredient).toHaveBeenCalledWith(
            7,
            3,
        );
    });

    it("should update a purchase quantity", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryRepository.updatePurchaseQuantity.mockResolvedValue(true);

        const res = await request(app)
            .put("/api/user-ingredients/history/11")
            .set("Cookie", authCookie(7))
            .send({ quantity: 4 });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.PURCHASE_UPDATED,
        });
        expect(
            deps.pantryRepository.updatePurchaseQuantity,
        ).toHaveBeenCalledWith(7, 11, 4);
    });

    it("should return purchase history", async () => {
        const { app, deps } = buildTestApp();
        const history = [{ id: 11, quantity: 2 }];

        deps.pantryRepository.findPurchaseHistory.mockResolvedValue(history);

        const res = await request(app)
            .get("/api/user-ingredients/history/3")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual(history);
        expect(deps.pantryRepository.findPurchaseHistory).toHaveBeenCalledWith(
            7,
            3,
        );
    });

    it("should map a missing purchase to an error response", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryRepository.updatePurchaseQuantity.mockResolvedValue(null);

        const res = await request(app)
            .put("/api/user-ingredients/history/99")
            .set("Cookie", authCookie(7))
            .send({ quantity: 4 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.PURCHASE_NOT_FOUND });
    });
});
