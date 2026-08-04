import { ValidationError } from "domain/errors/AppError";

import GetIntakeLog from "application/use-cases/calories/GetIntakeLog";

import { catchError } from "test/helpers/assertions";

function setup() {
    const calorieRepository = { findIntake: jest.fn() };
    const useCase = new GetIntakeLog(calorieRepository);

    return { useCase, calorieRepository };
}

describe("GetIntakeLog", () => {
    it("should reject a query missing the from/to range", async () => {
        const { useCase } = setup();

        const error = await catchError(useCase.execute(7, {}));

        expect(error).toBeInstanceOf(ValidationError);
    });

    it("should return the intake entries for the requested range", async () => {
        const { useCase, calorieRepository } = setup();
        const entries = [{ id: 1 }];

        calorieRepository.findIntake.mockResolvedValue(entries);

        const result = await useCase.execute(7, {
            from: "2026-01-01T00:00:00.000Z",
            to: "2026-01-31T23:59:59.999Z",
        });

        expect(result).toBe(entries);
        expect(calorieRepository.findIntake).toHaveBeenCalledWith(
            7,
            "2026-01-01T00:00:00.000Z",
            "2026-01-31T23:59:59.999Z",
        );
    });
});
