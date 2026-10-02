import { COOKING_UNDO_WINDOW_MS } from "constants/cooking";
import { ERROR_CODES } from "constants/errorCodes";
import {
    ConflictError,
    NotFoundError,
    ValidationError,
} from "domain/errors/AppError";

import UndoCooking from "application/use-cases/pantry/UndoCooking";

import { catchError } from "test/helpers/assertions";

function setup() {
    const pantryConsumptionRepository = { undo: jest.fn() };
    const useCase = new UndoCooking(pantryConsumptionRepository);

    return { useCase, pantryConsumptionRepository };
}

describe("UndoCooking", () => {
    it("should undo the cooking within the undo window", async () => {
        const { useCase, pantryConsumptionRepository } = setup();

        pantryConsumptionRepository.undo.mockResolvedValue("undone");

        await useCase.execute(7, "42");

        expect(pantryConsumptionRepository.undo).toHaveBeenCalledWith(
            7,
            42,
            COOKING_UNDO_WINDOW_MS,
        );
    });

    it("should throw a 404 NotFoundError for someone else's or a missing record", async () => {
        const { useCase, pantryConsumptionRepository } = setup();

        pantryConsumptionRepository.undo.mockResolvedValue("not_found");

        const error = await catchError(useCase.execute(7, 42));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.CONSUMPTION_NOT_FOUND,
            404,
        );
    });

    it("should throw a 409 ConflictError once already undone or out of time", async () => {
        const { useCase, pantryConsumptionRepository } = setup();

        pantryConsumptionRepository.undo.mockResolvedValue("unavailable");

        const error = await catchError(useCase.execute(7, 42));

        expect(error).toBeAppError(
            ConflictError,
            ERROR_CODES.UNDO_EXPIRED,
            409,
        );
    });

    it("should throw a 404 NotFoundError when the account no longer exists", async () => {
        const { useCase, pantryConsumptionRepository } = setup();

        pantryConsumptionRepository.undo.mockResolvedValue("person_not_found");

        const error = await catchError(useCase.execute(7, 42));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.USER_NOT_FOUND,
            404,
        );
    });

    it("should reject an id that is not a positive integer", async () => {
        const { useCase, pantryConsumptionRepository } = setup();

        const error = await catchError(useCase.execute(7, "abc"));

        expect(error).toBeInstanceOf(ValidationError);
        expect(pantryConsumptionRepository.undo).not.toHaveBeenCalled();
    });
});
