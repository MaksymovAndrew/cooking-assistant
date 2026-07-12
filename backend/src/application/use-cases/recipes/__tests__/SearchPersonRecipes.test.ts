import { ValidationError } from "domain/errors/AppError";

import SearchPersonRecipes from "application/use-cases/recipes/SearchPersonRecipes";

import { catchError } from "test/helpers/assertions";

function setup() {
    const recipeRepository = { searchByPerson: jest.fn() };
    const useCase = new SearchPersonRecipes(recipeRepository);

    return { useCase, recipeRepository };
}

describe("SearchPersonRecipes", () => {
    it("should search person recipes with filters and return the repository result", async () => {
        const { useCase, recipeRepository } = setup();
        const filters = { ingredient_name: "tomato", type_ids: "2" };
        const paginated = {
            items: [{ id: 1, title: "Tomato soup" }],
            total: 1,
        };

        recipeRepository.searchByPerson.mockResolvedValue(paginated);

        const result = await useCase.execute(7, filters);

        expect(recipeRepository.searchByPerson).toHaveBeenCalledWith(
            7,
            filters,
        );
        expect(result).toEqual(paginated);
    });

    it("should pass through valid limit and offset as numbers", async () => {
        const { useCase, recipeRepository } = setup();
        const paginated = { items: [], total: 0 };

        recipeRepository.searchByPerson.mockResolvedValue(paginated);

        await useCase.execute(7, { limit: "10", offset: "20" });

        expect(recipeRepository.searchByPerson).toHaveBeenCalledWith(7, {
            limit: 10,
            offset: 20,
        });
    });

    it("should throw a 400 ValidationError when limit exceeds the maximum", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(useCase.execute(7, { limit: 101 }));

        expect(error).toBeAppError(
            ValidationError,
            "limit: Limit must be at most 100",
            400,
        );
        expect(recipeRepository.searchByPerson).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when a date filter is malformed", async () => {
        const { useCase, recipeRepository } = setup();

        const error = await catchError(
            useCase.execute(7, { start_date: "junk" }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "start_date: Start date must be a YYYY-MM-DD date",
            400,
        );
        expect(recipeRepository.searchByPerson).not.toHaveBeenCalled();
    });
});
