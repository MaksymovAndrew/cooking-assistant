import request from "supertest";

import { buildTestApp } from "test/helpers/testApp";

const RECIPE_TYPES_PATH = "/api/recipe-types";

describe("recipe type routes", () => {
    it("should return recipe types for an anonymous request", async () => {
        const { app, deps } = buildTestApp();
        const types = [{ id: 1, type_name: "Soup", description: null }];

        deps.recipeTypeRepository.findAll.mockResolvedValue(types);

        const res = await request(app).get(RECIPE_TYPES_PATH);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(types);
    });
});
