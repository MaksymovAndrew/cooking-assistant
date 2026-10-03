import type { MenuDetailRecipe } from "types/menu";
import type { RecipeListItem } from "types/recipe";

// only the form's fields, so a recipe picked from search equals the one the menu loaded
export const toRecipeListItem = ({
    id,
    title,
    type_name,
    creation_date,
    cooking_time,
}: RecipeListItem): RecipeListItem => ({
    id,
    title,
    type_name,
    creation_date,
    cooking_time,
});

export const menuRecipeToListItem = (
    recipe: MenuDetailRecipe,
): RecipeListItem => toRecipeListItem({ ...recipe, id: recipe.recipe_id });

export const recipeIdsOf = (recipes: RecipeListItem[]): number[] =>
    recipes.map((recipe) => recipe.id);
