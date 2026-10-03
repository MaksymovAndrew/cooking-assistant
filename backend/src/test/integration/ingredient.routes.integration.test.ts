import request from "supertest";

import { catalogIngredient } from "test/helpers/repositoryRows";
import { buildTestApp } from "test/helpers/testApp";

const INGREDIENTS_PATH = "/api/ingredients";

describe("ingredient routes", () => {
    it("should return ingredients for an anonymous request", async () => {
        const { app, deps } = buildTestApp();
        const ingredients = [catalogIngredient()];

        deps.ingredientRepository.findAll.mockResolvedValue(ingredients);

        const res = await request(app).get(INGREDIENTS_PATH);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(ingredients);
    });
});
