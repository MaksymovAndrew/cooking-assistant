import type { RecipeDetails } from "types/recipe";

import { recipeCookRequirements } from "utils/cookPreview";

import { useCookedItHandler } from "./useCookedItHandler";
import { useDeleteRecipeHandler } from "./useDeleteRecipeHandler";
import { useExceedsCalorieBudget } from "./useExceedsCalorieBudget";
import { useLogIntakeHandler } from "./useLogIntakeHandler";

export const useRecipeDetailActions = (
    recipe: RecipeDetails,
    portionCount: number,
) => {
    const onDelete = useDeleteRecipeHandler(recipe);
    const onLogIntake = useLogIntakeHandler({
        recipeId: recipe.id,
        title: recipe.title,
        caloriesPerPortion: recipe.calories_per_portion,
        initialPortions: portionCount,
    });
    const onCook = useCookedItHandler({
        recipeId: recipe.id,
        title: recipe.title,
        requirements: recipeCookRequirements(recipe.ingredients),
        caloriesPerPortion: recipe.calories_per_portion,
        initialPortions: portionCount,
        isSignedIn: recipe.isFavourite !== null,
    });
    const exceedsBudget = useExceedsCalorieBudget(
        recipe.calories_per_portion,
        portionCount,
    );

    return { onDelete, onLogIntake, onCook, exceedsBudget };
};
