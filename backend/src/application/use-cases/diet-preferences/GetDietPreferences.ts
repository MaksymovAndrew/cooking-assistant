import type {
    DietPreferences,
    DietPreferencesRepository,
} from "domain/repositories/DietPreferencesRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class GetDietPreferences {
    constructor(
        private dietPreferencesRepository: Pick<
            DietPreferencesRepository,
            "findByPerson"
        >,
    ) {}

    async execute(personId: string | number): Promise<DietPreferences> {
        const validPersonId = validate(idSchema, personId);

        return this.dietPreferencesRepository.findByPerson(validPersonId);
    }
}
