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
            ingredient_name: "tomato",
            type_ids: "1,2",
            min_cooking_time: "10",
            sort_order: "asc",
        };
        const paginated = {
            items: [{ id: 1, title: "Tomato soup" }],
            total: 1,
        };

        recipeRepository.search.mockResolvedValue(paginated);

        const result = await useCase.execute(filters);

        expect(recipeRepository.search).toHaveBeenCalledWith({
            ingredient_name: "tomato",
            type_ids: "1,2",
            min_cooking_time: 10,
            sort_order: "asc",
        });
        expect(result).toEqual(paginated);
    });

    it("should pass through valid limit and offset as numbers", async () => {
        const { useCase, recipeRepository } = setup();
        const paginated = { items: [], total: 0 };

        recipeRepository.search.mockResolvedValue(paginated);

        await useCase.execute({ limit: "10", offset: "20" });

        expect(recipeRepository.search).toHaveBeenCalledWith({
            limit: 10,
            offset: 20,
        });
    });

    it("should throw a 400 ValidationError when type_ids is not an id list", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute({ type_ids: "abc" }));

        expect(error).toBeAppError(
            ValidationError,
            "type_ids: Type IDs must be a comma-separated list of IDs",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when sort_order is unknown", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute({ sort_order: "junk" }));

        expect(error).toBeAppError(
            ValidationError,
            "sort_order: Invalid enum value. Expected 'asc' | 'desc', received 'junk'",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when limit exceeds the maximum", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute({ limit: 101 }));

        expect(error).toBeAppError(
            ValidationError,
            "limit: Limit must be at most 100",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when limit is not positive", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute({ limit: 0 }));

        expect(error).toBeAppError(
            ValidationError,
            "limit: Limit must be positive",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when offset is negative", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute({ offset: -1 }));

        expect(error).toBeAppError(
            ValidationError,
            "offset: Offset must be at least 0",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when offset is not an integer", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute({ offset: 1.5 }));

        expect(error).toBeAppError(
            ValidationError,
            "offset: Offset must be an integer",
            400,
        );
        expect(recipeRepository.search).not.toHaveBeenCalled();
    });
});
