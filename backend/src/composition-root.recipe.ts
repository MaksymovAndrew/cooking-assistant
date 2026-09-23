import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import type PhotoCleanup from "application/media/PhotoCleanup";
import CreateRecipe from "application/use-cases/recipes/CreateRecipe";
import DeleteRecipe from "application/use-cases/recipes/DeleteRecipe";
import GetAllRecipes from "application/use-cases/recipes/GetAllRecipes";
import GetRecipeById from "application/use-cases/recipes/GetRecipeById";
import GetRecipeStats from "application/use-cases/recipes/GetRecipeStats";
import SearchPersonRecipes from "application/use-cases/recipes/SearchPersonRecipes";
import SearchRecipes from "application/use-cases/recipes/SearchRecipes";
import UpdateRecipe from "application/use-cases/recipes/UpdateRecipe";

import RecipeController from "controller/recipe.controller";
import RecipeSearchController from "controller/recipeSearch.controller";

// split out of composition-root.ts, which hit the file's line-count lint cap once this was inlined
export interface RecipeControllerDeps {
    recipeRepository: RecipeRepository;
    ingredientRepository: IngredientRepository;
    photoCleanup: PhotoCleanup;
}

export interface RecipeControllers {
    recipeController: RecipeController;
    recipeSearchController: RecipeSearchController;
}

export function buildRecipeControllers({
    recipeRepository,
    ingredientRepository,
    photoCleanup,
}: RecipeControllerDeps): RecipeControllers {
    return {
        recipeController: new RecipeController({
            createRecipe: new CreateRecipe(
                recipeRepository,
                ingredientRepository,
            ),
            getRecipeById: new GetRecipeById(recipeRepository),
            updateRecipe: new UpdateRecipe(
                recipeRepository,
                ingredientRepository,
            ),
            deleteRecipe: new DeleteRecipe(recipeRepository, photoCleanup),
        }),
        recipeSearchController: new RecipeSearchController({
            getAllRecipes: new GetAllRecipes(recipeRepository),
            searchRecipes: new SearchRecipes(recipeRepository),
            searchPersonRecipes: new SearchPersonRecipes(recipeRepository),
            getRecipeStats: new GetRecipeStats(recipeRepository),
        }),
    };
}
