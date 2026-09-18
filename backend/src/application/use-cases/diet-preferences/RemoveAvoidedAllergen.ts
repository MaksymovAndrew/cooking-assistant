import type { DietPreferencesRepository } from "domain/repositories/DietPreferencesRepository";

import { idSchema } from "application/validation/common.schemas";
import { allergenSlugSchema } from "application/validation/dietPreferences.schemas";
import { validate } from "application/validation/validate";

export default class RemoveAvoidedAllergen {
    constructor(
        private dietPreferencesRepository: Pick<
            DietPreferencesRepository,
            "removeAllergen"
        >,
    ) {}

    async execute(personId: string | number, allergen: unknown): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validAllergen = validate(allergenSlugSchema, allergen);

        await this.dietPreferencesRepository.removeAllergen(
            validPersonId,
            validAllergen,
        );
    }
}
