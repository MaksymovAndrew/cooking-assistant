import request from "supertest";

import { ValidationError } from "domain/errors/AppError";

import { authCookie, buildTestApp } from "test/helpers/testApp";

const MENU_CATEGORIES_PATH = "/api/menu-categories";

describe("menu category routes", () => {
    it("should return 401 without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get(MENU_CATEGORIES_PATH);

        expect(res.status).toBe(401);
    });

    it("should return menu categories", async () => {
        const { app, deps } = buildTestApp();
        const categories = [{ menu_category_id: 2, category_name: "Dinner" }];

        deps.menuCategoryRepository.findAll.mockResolvedValue(categories);

        const res = await request(app)
            .get(MENU_CATEGORIES_PATH)
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(categories);
    });

    it("should map a domain error to an error response", async () => {
        const { app, deps } = buildTestApp();

        deps.menuCategoryRepository.findAll.mockRejectedValue(
            new ValidationError("Category query is invalid"),
        );

        const res = await request(app)
            .get(MENU_CATEGORIES_PATH)
            .set("Cookie", authCookie());

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "Category query is invalid" });
    });
});
