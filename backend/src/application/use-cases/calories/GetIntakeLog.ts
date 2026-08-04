import type {
    CalorieIntakeRow,
    CalorieRepository,
} from "domain/repositories/CalorieRepository";

import { intakeRangeSchema } from "application/validation/calorie.schemas";
import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class GetIntakeLog {
    constructor(
        private calorieRepository: Pick<CalorieRepository, "findIntake">,
    ) {}

    async execute(
        personId: string | number,
        query: unknown,
    ): Promise<CalorieIntakeRow[]> {
        const validPersonId = validate(idSchema, personId);
        const { from, to } = validate(intakeRangeSchema, query);

        return this.calorieRepository.findIntake(validPersonId, from, to);
    }
}
