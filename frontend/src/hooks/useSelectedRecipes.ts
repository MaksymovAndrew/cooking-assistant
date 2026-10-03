import { useCallback, useState } from "react";

import type { RecipeListItem } from "types/recipe";

import { moveBefore } from "utils/listOrder";
import { toRecipeListItem } from "utils/menuFormRecipes";

export const useSelectedRecipes = () => {
    const [selectedRecipes, setSelectedRecipes] = useState<RecipeListItem[]>(
        [],
    );

    const removeRecipe = useCallback((recipeId: number) => {
        setSelectedRecipes((prev) =>
            prev.filter((recipe) => recipe.id !== recipeId),
        );
    }, []);

    const toggleRecipeSelection = useCallback((picked: RecipeListItem) => {
        setSelectedRecipes((prev) =>
            prev.some((recipe) => recipe.id === picked.id)
                ? prev.filter((recipe) => recipe.id !== picked.id)
                : [...prev, toRecipeListItem(picked)],
        );
    }, []);

    const reorderSelectedRecipes = useCallback(
        (fromId: number, toId: number) => {
            setSelectedRecipes((prev) => {
                const ids = prev.map((recipe) => recipe.id);

                return moveBefore(prev, ids.indexOf(fromId), ids.indexOf(toId));
            });
        },
        [],
    );

    return {
        selectedRecipes,
        setSelectedRecipes,
        toggleRecipeSelection,
        removeRecipe,
        reorderSelectedRecipes,
    };
};
