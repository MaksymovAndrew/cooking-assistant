import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import GetMenuById from "application/use-cases/menus/GetMenuById";

import { catchError } from "test/helpers/assertions";

function setup() {
    const menuRepository = { findByIdWithRecipes: jest.fn() };
    const useCase = new GetMenuById(menuRepository);

    return { useCase, menuRepository };
}

describe("GetMenuById", () => {
    it("should throw a 400 ValidationError when the menu id is missing", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(useCase.execute(null, 7));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "ID is required",
        );
        expect(menuRepository.findByIdWithRecipes).not.toHaveBeenCalled();
    });

    it("should throw a 404 NotFoundError when the menu does not belong to the user", async () => {
        const { useCase, menuRepository } = setup();

        menuRepository.findByIdWithRecipes.mockResolvedValue(null);

        const error = await catchError(useCase.execute(9, 7));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.MENU_NOT_FOUND,
            404,
        );
    });

    it("should return the menu scoped to the requesting user", async () => {
        const { useCase, menuRepository } = setup();
        const menu = { id: 9, menuTitle: "Weekly menu" };

        menuRepository.findByIdWithRecipes.mockResolvedValue(menu);

        const result = await useCase.execute(9, 7);

        expect(menuRepository.findByIdWithRecipes).toHaveBeenCalledWith(9, 7);
        expect(result).toEqual(menu);
    });
});
