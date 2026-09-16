import request from "supertest";

import { ERROR_CODES } from "constants/errorCodes";
import { SHOPPING_LIST_LIMITS } from "constants/shoppingList";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

const LIST_PATH = "/api/shopping-list";

const ITEM = {
    id: 3,
    name: "Milk",
    note: null,
    ingredient_id: null,
    ingredient_slug: null,
    unit_name: null,
    quantity: null,
    checked: false,
    position: 0,
};

describe("shopping list routes", () => {
    it("should return 401 without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get(LIST_PATH);

        expect(res.status).toBe(401);
    });

    it("should return the current user's items", async () => {
        const { app, deps } = buildTestApp();

        deps.shoppingListRepository.findByPerson.mockResolvedValue([ITEM]);

        const res = await request(app)
            .get(LIST_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual([ITEM]);
        expect(deps.shoppingListRepository.findByPerson).toHaveBeenCalledWith(
            7,
        );
    });

    it("should add a free-text item", async () => {
        const { app, deps } = buildTestApp();

        deps.shoppingListRepository.addItem.mockResolvedValue(ITEM);

        const res = await request(app)
            .post(LIST_PATH)
            .set("Cookie", authCookie(7))
            .send({ name: "Milk" });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(ITEM);
    });

    it("should map a full list to a 409 response", async () => {
        const { app, deps } = buildTestApp();

        deps.shoppingListRepository.addItem.mockResolvedValue(null);

        const res = await request(app)
            .post(LIST_PATH)
            .set("Cookie", authCookie(7))
            .send({ name: "Milk" });

        expect(res.status).toBe(409);
        expect(res.body).toEqual(
            errorBody(ERROR_CODES.SHOPPING_LIST_LIMIT_REACHED),
        );
    });

    it("should update an item", async () => {
        const { app, deps } = buildTestApp();

        deps.shoppingListRepository.updateItem.mockResolvedValue({
            ...ITEM,
            checked: true,
        });

        const res = await request(app)
            .patch(`${LIST_PATH}/3`)
            .set("Cookie", authCookie(7))
            .send({ checked: true });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ...ITEM, checked: true });
        expect(deps.shoppingListRepository.updateItem).toHaveBeenCalledWith(
            7,
            3,
            { checked: true },
        );
    });

    it("should map a missing item to a 404 response", async () => {
        const { app, deps } = buildTestApp();

        deps.shoppingListRepository.deleteItem.mockResolvedValue(false);

        const res = await request(app)
            .delete(`${LIST_PATH}/99`)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(404);
        expect(res.body).toEqual(
            errorBody(ERROR_CODES.SHOPPING_LIST_ITEM_NOT_FOUND),
        );
    });

    it("should clear checked items instead of treating checked as an item id", async () => {
        const { app, deps } = buildTestApp();

        deps.shoppingListRepository.deleteChecked.mockResolvedValue(undefined);

        const res = await request(app)
            .delete(`${LIST_PATH}/checked`)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(204);
        expect(deps.shoppingListRepository.deleteChecked).toHaveBeenCalledWith(
            7,
        );
        expect(deps.shoppingListRepository.deleteItem).not.toHaveBeenCalled();
    });

    it("should map a stale order to a 409 response", async () => {
        const { app, deps } = buildTestApp();

        deps.shoppingListRepository.reorder.mockResolvedValue(false);

        const res = await request(app)
            .put(`${LIST_PATH}/order`)
            .set("Cookie", authCookie(7))
            .send({ ids: [2, 1] });

        expect(res.status).toBe(409);
        expect(res.body).toEqual(
            errorBody(ERROR_CODES.SHOPPING_LIST_ORDER_OUT_OF_DATE),
        );
    });

    it("should add missing ingredients", async () => {
        const { app, deps } = buildTestApp();
        const items = [{ ingredient_id: 4, quantity: 250 }];

        deps.ingredientRepository.findExistingIds.mockResolvedValue([4]);
        deps.shoppingListRepository.addIngredients.mockResolvedValue(true);

        const res = await request(app)
            .post(`${LIST_PATH}/ingredients`)
            .set("Cookie", authCookie(7))
            .send({ items });

        expect(res.status).toBe(204);
        expect(deps.shoppingListRepository.addIngredients).toHaveBeenCalledWith(
            7,
            items,
            SHOPPING_LIST_LIMITS.MAX_ITEMS,
        );
    });
});
