import type { CalorieRepository } from "domain/repositories/CalorieRepository";

import { updateCalorieGoalSchema } from "application/validation/calorie.schemas";
import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class UpdateCalorieGoal {
    constructor(
        private calorieRepository: Pick<CalorieRepository, "updateGoal">,
    ) {}

    async execute(personId: string | number, input: unknown): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const goal = validate(updateCalorieGoalSchema, input);

        await this.calorieRepository.updateGoal(validPersonId, goal);
    }
}
