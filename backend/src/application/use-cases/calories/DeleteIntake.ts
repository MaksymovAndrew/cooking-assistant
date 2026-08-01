import { ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError } from "domain/errors/AppError";
import type { CalorieRepository } from "domain/repositories/CalorieRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class DeleteIntake {
    constructor(
        private calorieRepository: Pick<CalorieRepository, "deleteIntake">,
    ) {}

    async execute(
        personId: string | number,
        intakeId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validIntakeId = validate(idSchema, intakeId);

        const deleted = await this.calorieRepository.deleteIntake(
            validPersonId,
            validIntakeId,
        );

        if (!deleted) {
            throw new NotFoundError(ERROR_MESSAGES.INTAKE_NOT_FOUND);
        }
    }
}
