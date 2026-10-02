import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";
import { DEFAULT_LOCALE } from "constants/locales";
import { translateMessage } from "i18n/translate";

import { errorBody } from "test/helpers/errorBody";
import {
    pantryIngredient,
    purchaseHistoryEntry,
} from "test/helpers/repositoryRows";
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
        const ingredients = [pantryIngredient()];

        deps.pantryRepository.findByUser.mockResolvedValue(ingredients);

        const res = await request(app)
            .get(USER_INGREDIENTS_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject([
            { ingredient_id: 3, ingredient_name: "Tomato" },
        ]);
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
            message: translateMessage("ingredientsUpdated", DEFAULT_LOCALE),
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
            message: translateMessage("ingredientDeleted", DEFAULT_LOCALE),
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
            message: translateMessage("purchaseUpdated", DEFAULT_LOCALE),
        });
        expect(
            deps.pantryRepository.updatePurchaseQuantity,
        ).toHaveBeenCalledWith(7, 11, 4);
    });

    it("should return purchase history", async () => {
        const { app, deps } = buildTestApp();
        const history = [purchaseHistoryEntry()];

        deps.pantryRepository.findPurchaseHistory.mockResolvedValue(history);

        const res = await request(app)
            .get("/api/user-ingredients/history/3")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject([{ id: 11, quantity: 2 }]);
        expect(deps.pantryRepository.findPurchaseHistory).toHaveBeenCalledWith(
            7,
            3,
        );
    });

    it("should map a missing purchase to an error response", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryRepository.updatePurchaseQuantity.mockResolvedValue(false);

        const res = await request(app)
            .put("/api/user-ingredients/history/99")
            .set("Cookie", authCookie(7))
            .send({ quantity: 4 });

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.PURCHASE_NOT_FOUND));
    });

    it("should delete a single purchase", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryRepository.deletePurchases.mockResolvedValue(1);

        const res = await request(app)
            .delete("/api/user-ingredients/history/11")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            message: translateMessage("purchaseDeleted", DEFAULT_LOCALE),
        });
        expect(deps.pantryRepository.deletePurchases).toHaveBeenCalledWith(
            7,
            [11],
        );
    });

    it("should answer 404 when the purchase to delete does not exist", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryRepository.deletePurchases.mockResolvedValue(0);

        const res = await request(app)
            .delete("/api/user-ingredients/history/99")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(404);
        expect(res.body).toEqual(errorBody(ERROR_CODES.PURCHASE_NOT_FOUND));
    });

    it("should discard several purchases at once", async () => {
        const { app, deps } = buildTestApp();

        deps.pantryRepository.deletePurchases.mockResolvedValue(2);

        const res = await request(app)
            .post("/api/user-ingredients/history/discard")
            .set("Cookie", authCookie(7))
            .send({ purchaseIds: [11, 12] });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ discarded: 2 });
        expect(deps.pantryRepository.deletePurchases).toHaveBeenCalledWith(
            7,
            [11, 12],
        );
    });
});
