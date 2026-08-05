import { ValidationError } from "domain/errors/AppError";

import GetAllMenus from "application/use-cases/menus/GetAllMenus";

import { catchError } from "test/helpers/assertions";

function setup() {
    const menuRepository = { findAll: jest.fn() };
    const useCase = new GetAllMenus(menuRepository);

    return { useCase, menuRepository };
}

describe("GetAllMenus", () => {
    it("should return all menus from the repository with filters", async () => {
        const { useCase, menuRepository } = setup();
        const filters = { menu_name: "weekly", category_ids: "1,2" };
        const paginated = {
            items: [{ id: 9, menuTitle: "Weekly menu" }],
            total: 1,
        };

        menuRepository.findAll.mockResolvedValue(paginated);

        const result = await useCase.execute(7, filters);

        expect(menuRepository.findAll).toHaveBeenCalledWith(filters, 7);
        expect(result).toEqual(paginated);
    });

    it("should pass through valid limit and offset as numbers", async () => {
        const { useCase, menuRepository } = setup();
        const paginated = { items: [], total: 0 };

        menuRepository.findAll.mockResolvedValue(paginated);

        await useCase.execute(7, { limit: "10", offset: "20" });

        expect(menuRepository.findAll).toHaveBeenCalledWith(
            { limit: 10, offset: 20 },
            7,
        );
    });

    it("should pass a null userId through for a guest requester", async () => {
        const { useCase, menuRepository } = setup();
        const paginated = { items: [], total: 0 };

        menuRepository.findAll.mockResolvedValue(paginated);

        await useCase.execute(null, {});

        expect(menuRepository.findAll).toHaveBeenCalledWith({}, null);
    });

    it("should throw a 400 ValidationError when offset is negative", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(useCase.execute(7, { offset: -1 }));

        expect(error).toBeAppError(
            ValidationError,
            "offset: Offset must be at least 0",
            400,
        );
        expect(menuRepository.findAll).not.toHaveBeenCalled();
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
        expect(menuRepository.findAll).not.toHaveBeenCalled();
    });
});
