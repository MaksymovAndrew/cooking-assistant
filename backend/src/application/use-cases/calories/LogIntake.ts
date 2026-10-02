import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";
import type { CalorieRepository } from "domain/repositories/CalorieRepository";

import { logIntakeSchema } from "application/validation/calorie.schemas";
import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

import { intakeCalories } from "./intakeCalories";
import {
    findSourceCalories,
    sourceIds,
    type SourceLookup,
} from "./sourceCalories";

export default class LogIntake {
    constructor(
        private calorieRepository: SourceLookup &
            Pick<CalorieRepository, "logIntake">,
    ) {}

    async execute(personId: string | number, input: unknown): Promise<unknown> {
        const validPersonId = validate(idSchema, personId);
        const { source, portions } = validate(logIntakeSchema, input);
        const info = await findSourceCalories(this.calorieRepository, source);

        if (info.calories === null) {
            throw new ValidationError(ERROR_CODES.CALORIES_NOT_AVAILABLE);
        }

        return this.calorieRepository.logIntake(validPersonId, {
            ...sourceIds(source),
            title: info.title,
            portions,
            calories: intakeCalories(info.calories, portions),
        });
    }
}
