import type { DietPreferencesRepository } from "domain/repositories/DietPreferencesRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class RemoveAvoidedIngredient {
    constructor(
        private dietPreferencesRepository: Pick<
            DietPreferencesRepository,
            "removeIngredient"
        >,
    ) {}

    async execute(
        personId: string | number,
        ingredientId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validIngredientId = validate(idSchema, ingredientId);

        await this.dietPreferencesRepository.removeIngredient(
            validPersonId,
            validIngredientId,
        );
    }
}
