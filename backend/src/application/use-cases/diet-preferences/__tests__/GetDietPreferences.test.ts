import GetDietPreferences from "application/use-cases/diet-preferences/GetDietPreferences";

function setup() {
    const dietPreferencesRepository = { findByPerson: jest.fn() };
    const useCase = new GetDietPreferences(dietPreferencesRepository);

    return { useCase, dietPreferencesRepository };
}

describe("GetDietPreferences", () => {
    it("should return what the user avoids", async () => {
        const { useCase, dietPreferencesRepository } = setup();
        const preferences = { allergens: ["gluten"], ingredient_ids: [4, 9] };

        dietPreferencesRepository.findByPerson.mockResolvedValue(preferences);

        const result = await useCase.execute("7");

        expect(dietPreferencesRepository.findByPerson).toHaveBeenCalledWith(7);
        expect(result).toEqual(preferences);
    });
});
