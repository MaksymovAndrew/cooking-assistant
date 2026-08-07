import { ERROR_MESSAGES } from "constants/errorMessages";
import { ValidationError } from "domain/errors/AppError";

import SearchRecipes from "application/use-cases/recipes/SearchRecipes";

import { catchError } from "test/helpers/assertions";

function setup() {
    const recipeRepository = { search: jest.fn() };
    const useCase = new SearchRecipes(recipeRepository);

    return { useCase, recipeRepository };
}

describe("SearchRecipes", () => {
    it("should search recipes with filters and return the repository result", async () => {
        const { useCase, recipeRepository } = setup();
        const filters = {
            ingredient_ids: "3,4",
            type_ids: "1,2",
            min_cooking_time: "10",
            sort_order: "asc",
        };
        const paginated = {
            items: [{ id: 1, title: "Tomato soup" }],
            total: 1,
        };

        recipeRepository.search.mockResolvedValue(paginated);

        const result = await useCase.execute(7, filters);

        expect(recipeRepository.search).toHaveBeenCalledWith(7, {
            ingredient_ids: "3,4",
            type_ids: "1,2",
            min_cooking_time: 10,
            sort_order: "asc",
        });
        expect(result).toEqual(paginated);
    });

    it("should pass through recipe_name unchanged", async () => {
        const { useCase, recipeRepository } = setup();
        const paginated = { items: [], total: 0 };

        recipeRepository.search.mockResolvedValue(paginated);

        await useCase.execute(7, { recipe_name: "Borscht" });

        expect(recipeRepository.search).toHaveBeenCalledWith(7, {
            recipe_name: "Borscht",
        });
    });

    it("should pass through valid limit and offset as numbers", async () => {
        const { useCase, recipeRepository } = setup();
        const paginated = { items: [], total: 0 };

        recipeRepository.search.mockResolvedValue(paginated);

        await useCase.execute(7, { limit: "10", offset: "20" });

        expect(recipeRepository.search).toHaveBeenCalledWith(7, {
            limit: 10,
            offset: 20,
        });
    });

    it("should pass through min_calories and max_calories as numbers", async () => {
        const { useCase, recipeRepository } = setup();
        const paginated = { items: [], total: 0 };

        recipeRepository.search.mockResolvedValue(paginated);

        await useCase.execute(7, { min_calories: "200", max_calories: "600" });

        expect(recipeRepository.search).toHaveBeenCalledWith(7, {
            min_calories: 200,
            max_calories: 600,
        });
    });

    it("should pass through the in_pantry filter as a boolean", async () => {
        const { useCase, recipeRepository } = setup();
        const paginated = { items: [], total: 0 };

        recipeRepository.search.mockResolvedValue(paginated);

        await useCase.execute(7, { in_pantry: "true" });

        expect(recipeRepository.search).toHaveBeenCalledWith(7, {
            in_pantry: true,
        });
    });

    it("should throw a 400 ValidationError when in_pantry is not a boolean", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(
            useCase.execute(7, { in_pantry: "yes" }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "in_pantry: In pantry must be true or false",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when type_ids is not an id list", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute(7, { type_ids: "abc" }));

        expect(error).toBeAppError(
            ValidationError,
            "type_ids: Type IDs must be a comma-separated list of IDs",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when ingredient_ids is not an id list", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(
            useCase.execute(7, { ingredient_ids: "abc" }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "ingredient_ids: Ingredient IDs must be a comma-separated list of IDs",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when ingredient_ids has too many items", async () => {
        const { useCase, recipeRepository } = setup();
        const tooMany = Array.from({ length: 21 }, (_, i) => i + 1).join(",");

        const error = await catchError(
            useCase.execute(7, { ingredient_ids: tooMany }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "ingredient_ids: Ingredient IDs must be at most 20 items",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when sort_order is unknown", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(
            useCase.execute(7, { sort_order: "junk" }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "sort_order: Invalid enum value. Expected 'asc' | 'desc', received 'junk'",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when limit exceeds the maximum", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute(7, { limit: 101 }));

        expect(error).toBeAppError(
            ValidationError,
            "limit: Limit must be at most 100",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when limit is not positive", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute(7, { limit: 0 }));

        expect(error).toBeAppError(
            ValidationError,
            "limit: Limit must be positive",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when offset is negative", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute(7, { offset: -1 }));

        expect(error).toBeAppError(
            ValidationError,
            "offset: Offset must be at least 0",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should search with a null userId for an anonymous request", async () => {
        const { useCase, recipeRepository } = setup();
        const paginated = { items: [], total: 0 };

        recipeRepository.search.mockResolvedValue(paginated);

        const result = await useCase.execute(null, { recipe_name: "Soup" });

        expect(recipeRepository.search).toHaveBeenCalledWith(null, {
            recipe_name: "Soup",
        });
        expect(result).toEqual(paginated);
    });

    it("should throw a 400 ValidationError when an anonymous request uses in_pantry", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(
            useCase.execute(null, { in_pantry: "true" }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_MESSAGES.RECIPE_IN_PANTRY_REQUIRES_LOGIN,
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when offset is not an integer", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute(7, { offset: 1.5 }));

        expect(error).toBeAppError(
            ValidationError,
            "offset: Offset must be an integer",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });
});
