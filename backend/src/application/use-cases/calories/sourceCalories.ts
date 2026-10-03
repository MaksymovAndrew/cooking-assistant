import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type {
    CalorieIntakeEntry,
    CalorieRepository,
    CalorieSourceInfo,
} from "domain/repositories/CalorieRepository";
import type { RecordSource } from "domain/repositories/recordSource";

export type SourceLookup = Pick<
    CalorieRepository,
    "findRecipeCalories" | "findMenuCalories"
>;

export async function findSourceCalories(
    calorieRepository: SourceLookup,
    source: RecordSource,
): Promise<CalorieSourceInfo> {
    const info =
        "recipeId" in source
            ? await calorieRepository.findRecipeCalories(source.recipeId)
            : await calorieRepository.findMenuCalories(source.menuId);

    if (!info) {
        throw new NotFoundError(
            "recipeId" in source
                ? ERROR_CODES.RECIPE_NOT_FOUND
                : ERROR_CODES.MENU_NOT_FOUND,
        );
    }

    return info;
}

export function sourceIds(
    source: RecordSource,
): Pick<CalorieIntakeEntry, "recipe_id" | "menu_id"> {
    return "recipeId" in source
        ? { recipe_id: source.recipeId }
        : { menu_id: source.menuId };
}
