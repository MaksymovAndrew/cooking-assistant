import type { RecipeDetails } from "types/recipe";

import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

type DeletableRecipe = Pick<RecipeDetails, "id" | "title">;

export const useDeleteRecipeHandler = (
    recipe: DeletableRecipe | undefined,
): (() => void) => {
    const dispatch = useAppDispatch();

    return () => {
        if (!recipe) {
            return;
        }

        dispatch(
            openModal({
                type: MODAL_TYPE.deleteRecipe,
                recipeId: String(recipe.id),
                recipeTitle: recipe.title,
            }),
        );
    };
};
