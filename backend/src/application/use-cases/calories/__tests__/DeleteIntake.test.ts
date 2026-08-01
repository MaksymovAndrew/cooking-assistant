import { ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError } from "domain/errors/AppError";

import DeleteIntake from "application/use-cases/calories/DeleteIntake";

import { catchError } from "test/helpers/assertions";

function setup() {
    const calorieRepository = { deleteIntake: jest.fn() };
    const useCase = new DeleteIntake(calorieRepository);

    return { useCase, calorieRepository };
}

describe("DeleteIntake", () => {
    it("should throw a 404 NotFoundError when the intake entry does not exist for the user", async () => {
        const { useCase, calorieRepository } = setup();

        calorieRepository.deleteIntake.mockResolvedValue(false);

        const error = await catchError(useCase.execute(7, 3));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_MESSAGES.INTAKE_NOT_FOUND,
            404,
        );
    });

    it("should delete the intake entry for the user when it exists", async () => {
        const { useCase, calorieRepository } = setup();

        calorieRepository.deleteIntake.mockResolvedValue(true);

        await useCase.execute(7, 3);

        expect(calorieRepository.deleteIntake).toHaveBeenCalledWith(7, 3);
    });
});
