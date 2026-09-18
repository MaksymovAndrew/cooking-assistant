import type { DietPreferencesRepository } from "domain/repositories/DietPreferencesRepository";

import AddAvoidedAllergen from "application/use-cases/diet-preferences/AddAvoidedAllergen";
import AddAvoidedIngredient from "application/use-cases/diet-preferences/AddAvoidedIngredient";
import GetDietPreferences from "application/use-cases/diet-preferences/GetDietPreferences";
import RemoveAvoidedAllergen from "application/use-cases/diet-preferences/RemoveAvoidedAllergen";
import RemoveAvoidedIngredient from "application/use-cases/diet-preferences/RemoveAvoidedIngredient";

import DietPreferencesController from "controller/dietPreferences.controller";

export interface DietPreferencesControllers {
    dietPreferencesController: DietPreferencesController;
}

export function buildDietPreferencesControllers(
    dietPreferencesRepository: DietPreferencesRepository,
): DietPreferencesControllers {
    const dietPreferencesController = new DietPreferencesController({
        getDietPreferences: new GetDietPreferences(dietPreferencesRepository),
        addAvoidedAllergen: new AddAvoidedAllergen(dietPreferencesRepository),
        removeAvoidedAllergen: new RemoveAvoidedAllergen(
            dietPreferencesRepository,
        ),
        addAvoidedIngredient: new AddAvoidedIngredient(
            dietPreferencesRepository,
        ),
        removeAvoidedIngredient: new RemoveAvoidedIngredient(
            dietPreferencesRepository,
        ),
    });

    return { dietPreferencesController };
}
