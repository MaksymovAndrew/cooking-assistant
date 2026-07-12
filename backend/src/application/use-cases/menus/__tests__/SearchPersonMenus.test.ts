import { ValidationError } from "domain/errors/AppError";

import SearchPersonMenus from "application/use-cases/menus/SearchPersonMenus";

import { catchError } from "test/helpers/assertions";

function setup() {
    const menuRepository = { searchByPerson: jest.fn() };
    const useCase = new SearchPersonMenus(menuRepository);

    return { useCase, menuRepository };
}

describe("SearchPersonMenus", () => {
    it("should search person menus with filters and return the repository result", async () => {
        const { useCase, menuRepository } = setup();
        const filters = { menu_name: "weekly" };
        const paginated = {
            items: [{ id: 9, menuTitle: "Weekly menu" }],
            total: 1,
        };

        menuRepository.searchByPerson.mockResolvedValue(paginated);

        const result = await useCase.execute(7, filters);

        expect(menuRepository.searchByPerson).toHaveBeenCalledWith(7, filters);
        expect(result).toEqual(paginated);
    });

    it("should pass through valid limit and offset as numbers", async () => {
        const { useCase, menuRepository } = setup();
        const paginated = { items: [], total: 0 };

        menuRepository.searchByPerson.mockResolvedValue(paginated);

        await useCase.execute(7, { limit: "10", offset: "20" });

        expect(menuRepository.searchByPerson).toHaveBeenCalledWith(7, {
            limit: 10,
            offset: 20,
        });
    });

    it("should throw a 400 ValidationError when limit exceeds the maximum", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(useCase.execute(7, { limit: 101 }));

        expect(error).toBeAppError(
            ValidationError,
            "limit: Limit must be at most 100",
            400,
        );
        expect(menuRepository.searchByPerson).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when category_ids is not an id list", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(
            useCase.execute(7, { category_ids: "abc" }),
        );

        expect(error).toBeAppError(
            ValidationError,
            "category_ids: Category IDs must be a comma-separated list of IDs",
            400,
        );
        expect(menuRepository.searchByPerson).not.toHaveBeenCalled();
    });
});
