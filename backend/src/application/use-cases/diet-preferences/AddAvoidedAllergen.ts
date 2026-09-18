import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { DietPreferencesRepository } from "domain/repositories/DietPreferencesRepository";

import { idSchema } from "application/validation/common.schemas";
import { allergenSlugSchema } from "application/validation/dietPreferences.schemas";
import { validate } from "application/validation/validate";

export default class AddAvoidedAllergen {
    constructor(
        private dietPreferencesRepository: Pick<
            DietPreferencesRepository,
            "addAllergen"
        >,
    ) {}

    async execute(personId: string | number, allergen: unknown): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validAllergen = validate(allergenSlugSchema, allergen);

        const personFound = await this.dietPreferencesRepository.addAllergen(
            validPersonId,
            validAllergen,
        );

        if (!personFound) {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }
    }
}
