import GetAllIngredients from "application/use-cases/ingredients/GetAllIngredients";

describe("GetAllIngredients", () => {
    it("should return all ingredients from the repository", async () => {
        const ingredients = [{ id: 3, name: "Tomato" }];
        const ingredientRepository = {
            findAll: jest.fn().mockResolvedValue(ingredients),
        };
        const useCase = new GetAllIngredients(ingredientRepository);

        const result = await useCase.execute();

        expect(ingredientRepository.findAll).toHaveBeenCalledWith();
        expect(result).toEqual(ingredients);
    });
});
