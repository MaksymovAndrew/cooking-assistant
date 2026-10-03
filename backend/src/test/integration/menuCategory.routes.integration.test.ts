import request from "supertest";

import { buildTestApp } from "test/helpers/testApp";

const MENU_CATEGORIES_PATH = "/api/menu-categories";

describe("menu category routes", () => {
    it("should return menu categories for an anonymous request", async () => {
        const { app, deps } = buildTestApp();
        const categories = [
            {
                menu_category_id: 2,
                category_name: "Dinner",
                category_description: null,
            },
        ];

        deps.menuCategoryRepository.findAll.mockResolvedValue(categories);

        const res = await request(app).get(MENU_CATEGORIES_PATH);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(categories);
    });
});
