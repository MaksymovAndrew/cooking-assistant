import request from "supertest";

import {
    ERROR_CODES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from "constants/errorMessages";

import { authCookie, buildTestApp } from "test/helpers/testApp";

const RECIPE_TITLE = "Tomato soup";
const RECIPE_12_PATH = "/api/recipe/12";

function makeRecipeBody() {
    return {
        title: RECIPE_TITLE,
        content: "Boil tomatoes",
        ingredients: [{ id: 3, quantity: 2, quantity_recipe_ingredients: 2 }],
        type_id: 1,
        cooking_time: 30,
        servings: "4",
    };
}

describe("recipe routes", () => {
    it("should return 401 without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get("/api/recipes");

        expect(res.status).toBe(401);
    });

    it("should create a recipe for an authenticated request", async () => {
        const { app, deps } = buildTestApp();
        const createdRecipe = { id: 12, title: RECIPE_TITLE };

        deps.recipeRepository.create.mockResolvedValue(createdRecipe);

        const res = await request(app)
            .post("/api/recipe")
            .set("Cookie", authCookie(7))
            .send(makeRecipeBody());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(createdRecipe);
        expect(deps.recipeRepository.create.mock.calls[0][0]).toMatchObject({
            title: RECIPE_TITLE,
            person_id: 7,
        });
    });

    it("should return recipes for an authenticated request", async () => {
        const { app, deps } = buildTestApp();
        const recipes = [{ id: 12, title: RECIPE_TITLE }];

        deps.recipeRepository.findAllWithIngredients.mockResolvedValue(recipes);

        const res = await request(app)
            .get("/api/recipes")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(recipes);
    });

    it("should return one recipe with ingredients", async () => {
        const { app, deps } = buildTestApp();
        const recipe = { id: 12, title: RECIPE_TITLE, ingredients: [] };

        deps.recipeRepository.findByIdWithIngredients.mockResolvedValue(recipe);

        const res = await request(app)
            .get(RECIPE_12_PATH)
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(recipe);
    });

    it("should return all known ingredients", async () => {
        const { app, deps } = buildTestApp();
        const ingredients = [{ id: 3, name: "tomato" }];

        deps.recipeRepository.findAllIngredients.mockResolvedValue(ingredients);

        const res = await request(app)
            .get("/api/ingredients")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(ingredients);
    });

    it("should update a recipe owned by the authenticated user", async () => {
        const { app, deps } = buildTestApp();
        const updatedRecipe = { id: 12, title: RECIPE_TITLE };

        deps.recipeRepository.update.mockResolvedValue(updatedRecipe);

        const res = await request(app)
            .put(RECIPE_12_PATH)
            .set("Cookie", authCookie(7))
            .send(makeRecipeBody());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(updatedRecipe);
        expect(deps.recipeRepository.update.mock.calls[0][0]).toBe(12);
        expect(deps.recipeRepository.update.mock.calls[0][1]).toBe(7);
    });

    it("should return 404 when updating a recipe of another user", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.update.mockResolvedValue(null);

        const res = await request(app)
            .put(RECIPE_12_PATH)
            .set("Cookie", authCookie(7))
            .send(makeRecipeBody());

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.RECIPE_NOT_FOUND });
    });

    it("should delete a recipe owned by the authenticated user", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.deleteById.mockResolvedValue(true);

        const res = await request(app)
            .delete(RECIPE_12_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: SUCCESS_MESSAGES.RECIPE_DELETED });
        expect(deps.recipeRepository.deleteById).toHaveBeenCalledWith(12, 7);
    });

    it("should search recipes by filters", async () => {
        const { app, deps } = buildTestApp();
        const paginated = {
            items: [{ id: 12, title: RECIPE_TITLE }],
            total: 1,
        };

        deps.recipeRepository.search.mockResolvedValue(paginated);

        const res = await request(app)
            .get("/api/recipes-by-filters?ingredient_name=tomato")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(paginated);
    });

    it("should pass limit and offset through to the repository", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.search.mockResolvedValue({ items: [], total: 0 });

        const res = await request(app)
            .get("/api/recipes-by-filters?limit=10&offset=20")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(deps.recipeRepository.search).toHaveBeenCalledWith({
            limit: 10,
            offset: 20,
        });
    });

    it("should return a 400 error body for an invalid filter", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .get("/api/recipes-by-filters?type_ids=abc")
            .set("Cookie", authCookie());

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: "type_ids: Type IDs must be a comma-separated list of IDs",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
        expect(deps.recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should return a 400 error body for an out-of-range limit", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .get("/api/recipes-by-filters?limit=101")
            .set("Cookie", authCookie());

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: "limit: Limit must be at most 100",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
        expect(deps.recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should search person recipes by the authenticated user", async () => {
        const { app, deps } = buildTestApp();
        const paginated = {
            items: [{ id: 12, title: RECIPE_TITLE }],
            total: 1,
        };

        deps.recipeRepository.searchByPerson.mockResolvedValue(paginated);

        const res = await request(app)
            .get("/api/recipes-filters-person?ingredient_name=tomato")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual(paginated);
        expect(deps.recipeRepository.searchByPerson).toHaveBeenCalledWith(7, {
            ingredient_name: "tomato",
        });
    });

    it("should return recipe stats", async () => {
        const { app, deps } = buildTestApp();
        const stats = { fastestRecipe: [{ id: 12 }] };

        deps.recipeRepository.getStats.mockResolvedValue(stats);

        const res = await request(app)
            .get("/api/recipes-stats")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(stats);
    });

    it("should map a not found recipe to an error response", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.findByIdWithIngredients.mockResolvedValue(null);

        const res = await request(app)
            .get("/api/recipe/99")
            .set("Cookie", authCookie());

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.RECIPE_NOT_FOUND });
    });
});
