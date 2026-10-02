import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";
import { roundQuantity } from "domain/pantry/allocateFifo";
import type {
    CalorieIntakeEntry,
    CalorieRepository,
    CalorieSourceInfo,
} from "domain/repositories/CalorieRepository";
import type {
    CookSource,
    PantryConsumptionRepository,
} from "domain/repositories/PantryConsumptionRepository";

import { intakeCalories } from "application/use-cases/calories/intakeCalories";
import { idSchema } from "application/validation/common.schemas";
import { cookSchema } from "application/validation/pantry.schemas";
import { validate } from "application/validation/validate";

import { type CookSummary, summariseCook } from "./cookSummary";

type SourceLookup = Pick<
    CalorieRepository,
    "findRecipeCalories" | "findMenuCalories"
>;

function sourceIds(
    source: CookSource,
): Pick<CalorieIntakeEntry, "recipe_id" | "menu_id"> {
    return "recipeId" in source
        ? { recipe_id: source.recipeId }
        : { menu_id: source.menuId };
}

export default class CookRecord {
    constructor(
        private pantryConsumptionRepository: PantryConsumptionRepository,
        private calorieRepository: SourceLookup,
    ) {}

    private async findSource(source: CookSource): Promise<CalorieSourceInfo> {
        const info =
            "recipeId" in source
                ? await this.calorieRepository.findRecipeCalories(
                      source.recipeId,
                  )
                : await this.calorieRepository.findMenuCalories(source.menuId);

        if (!info) {
            throw new NotFoundError(
                "recipeId" in source
                    ? ERROR_CODES.RECIPE_NOT_FOUND
                    : ERROR_CODES.MENU_NOT_FOUND,
            );
        }

        return info;
    }

    async execute(
        personId: string | number,
        input: unknown,
    ): Promise<CookSummary> {
        const validPersonId = validate(idSchema, personId);
        const { source, portions, log_calories } = validate(cookSchema, input);
        const info = await this.findSource(source);

        // checked before anything is written, so a refused request leaves the pantry as it was
        if (log_calories && info.calories === null) {
            throw new ValidationError(ERROR_CODES.CALORIES_NOT_AVAILABLE);
        }

        const requirements =
            await this.pantryConsumptionRepository.findRequirements(source);
        const needs = requirements.map(({ ingredient_id, quantity }) => ({
            ingredient_id,
            quantity: roundQuantity(quantity * portions),
        }));
        const calorieEntry =
            log_calories && info.calories !== null
                ? {
                      ...sourceIds(source),
                      title: info.title,
                      portions,
                      calories: intakeCalories(info.calories, portions),
                  }
                : null;
        const outcome = await this.pantryConsumptionRepository.cook(
            validPersonId,
            { source, title: info.title, portions, needs, calorieEntry },
        );

        if (outcome === "person_not_found") {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }

        return summariseCook(
            requirements,
            new Map(needs.map((need) => [need.ingredient_id, need.quantity])),
            outcome,
        );
    }
}
