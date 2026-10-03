import type { Controllers } from "composition-root";
import type { Router } from "express";

import createCalorieRouter from "./calorie.routes";
import createDietPreferencesRouter from "./dietPreferences.routes";
import createFavouriteRouter from "./favourite.routes";
import createIngredientRouter from "./ingredient.routes";
import createMenuRouter from "./menu.routes";
import createMenuCategoryRouter from "./menuCategory.routes";
import createPhotoRouter from "./photo.routes";
import createRatingRouter from "./rating.routes";
import createRecipeRouter from "./recipe.routes";
import createShoppingListRouter from "./shoppingList.routes";
import createTagRouter from "./tag.routes";
import createTypeRouter from "./type.routes";
import createUserRouter from "./user.routes";
import createUserIngredientsRouter from "./userIngredients.routes";

// every router behind the global limiter, in mount order
export function createDomainRouters(controllers: Controllers): Router[] {
    return [
        createUserRouter(
            controllers.userController,
            controllers.userSecurityController,
            controllers.auth,
        ),
        createIngredientRouter(
            controllers.ingredientController,
            controllers.auth,
        ),
        createRecipeRouter(
            controllers.recipeController,
            controllers.recipeSearchController,
            controllers.auth,
        ),
        createTypeRouter(controllers.recipeTypeController, controllers.auth),
        createUserIngredientsRouter(controllers, controllers.auth),
        createMenuRouter(controllers.menuController, controllers.auth),
        createMenuCategoryRouter(
            controllers.menuCategoryController,
            controllers.auth,
        ),
        createCalorieRouter(controllers.calorieController, controllers.auth),
        createFavouriteRouter(
            controllers.favouriteController,
            controllers.auth,
        ),
        createRatingRouter(controllers.ratingController, controllers.auth),
        createDietPreferencesRouter(
            controllers.dietPreferencesController,
            controllers.auth,
        ),
        createShoppingListRouter(
            controllers.shoppingListController,
            controllers.auth,
        ),
        createTagRouter(controllers.tagController, controllers.auth),
        createPhotoRouter(controllers.photoController, controllers.auth),
    ];
}
