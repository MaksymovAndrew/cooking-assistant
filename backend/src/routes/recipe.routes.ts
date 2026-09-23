import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type RecipeController from "controller/recipe.controller";
import type RecipeSearchController from "controller/recipeSearch.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createRecipeRouter(
    recipeController: RecipeController,
    recipeSearchController: RecipeSearchController,
    { authenticateToken, optionalAuth }: SessionAuth,
): Router {
    const router = express.Router();

    router.post(
        ROUTES.recipes.create,
        authenticateToken,
        recipeController.createRecipe,
    );

    router.get(
        ROUTES.recipes.list,
        authenticateToken,
        recipeSearchController.getAllRecipes,
    );

    router.get(
        ROUTES.recipes.byId,
        optionalAuth,
        recipeController.getRecipeWithIngredients,
    );

    router.put(
        ROUTES.recipes.byId,
        authenticateToken,
        recipeController.updateRecipe,
    );

    router.delete(
        ROUTES.recipes.byId,
        authenticateToken,
        recipeController.deleteRecipe,
    );

    router.get(
        ROUTES.recipes.byFilters,
        optionalAuth,
        recipeSearchController.searchRecipes,
    );

    router.get(
        ROUTES.recipes.byPerson,
        authenticateToken,
        recipeSearchController.searchPersonRecipes,
    );

    router.get(
        ROUTES.recipes.stats,
        authenticateToken,
        recipeSearchController.getRecipesStats,
    );

    return router;
}
