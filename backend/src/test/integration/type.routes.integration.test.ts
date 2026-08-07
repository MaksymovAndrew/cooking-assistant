import request from "supertest";

import { ERROR_MESSAGES } from "constants/errorMessages";

import { authCookie, buildTestApp } from "test/helpers/testApp";

const RECIPE_TYPES_PATH = "/api/recipe-types";

describe("recipe type routes", () => {
    it("should return recipe types for an anonymous request", async () => {
        const { app, deps } = buildTestApp();
        const types = [{ id: 1, type_name: "Soup" }];

        deps.recipeTypeRepository.findAll.mockResolvedValue(types);

        const res = await request(app).get(RECIPE_TYPES_PATH);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(types);
    });

    it("should return recipe types", async () => {
        const { app, deps } = buildTestApp();
        const types = [{ id: 1, type_name: "Soup" }];

        deps.recipeTypeRepository.findAll.mockResolvedValue(types);

        const res = await request(app)
            .get(RECIPE_TYPES_PATH)
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(types);
    });

    it("should not expose a route to create recipe types", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .post(RECIPE_TYPES_PATH)
            .set("Cookie", authCookie())
            .send({ type_name: "Soup", description: "Warm" });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.NOT_FOUND });
    });

    it("should not expose a route to update recipe types", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .put("/api/recipe-type/1")
            .set("Cookie", authCookie())
            .send({ type_name: "Soup", description: "Hot" });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.NOT_FOUND });
    });

    it("should not expose a route to delete recipe types", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .delete("/api/recipe-type/1")
            .set("Cookie", authCookie());

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.NOT_FOUND });
    });
});
