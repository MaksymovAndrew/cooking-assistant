import request from "supertest";

import { authCookie, buildTestApp } from "test/helpers/testApp";

const INGREDIENTS_PATH = "/api/ingredients";

describe("ingredient routes", () => {
    it("should return ingredients for an anonymous request", async () => {
        const { app, deps } = buildTestApp();
        const ingredients = [{ id: 3, slug: "tomato", name: "Tomato" }];

        deps.ingredientRepository.findAll.mockResolvedValue(ingredients);

        const res = await request(app).get(INGREDIENTS_PATH);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(ingredients);
    });

    it("should return all known ingredients", async () => {
        const { app, deps } = buildTestApp();
        const ingredients = [{ id: 3, slug: "tomato", name: "Tomato" }];

        deps.ingredientRepository.findAll.mockResolvedValue(ingredients);

        const res = await request(app)
            .get(INGREDIENTS_PATH)
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(ingredients);
    });
});
