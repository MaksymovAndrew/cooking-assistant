import type { Controllers } from "composition-root";
import type { Router } from "express";

import createCalorieRouter from "routes/calorie.routes";
import createDietPreferencesRouter from "routes/dietPreferences.routes";
import createFavouriteRouter from "routes/favourite.routes";
import createIngredientRouter from "routes/ingredient.routes";
import createMenuRouter from "routes/menu.routes";
import createMenuCategoryRouter from "routes/menuCategory.routes";
import createPhotoRouter from "routes/photo.routes";
import createRatingRouter from "routes/rating.routes";
import createRecipeRouter from "routes/recipe.routes";
import createShoppingListRouter from "routes/shoppingList.routes";
import createTagRouter from "routes/tag.routes";
import createTypeRouter from "routes/type.routes";
import createUserRouter from "routes/user.routes";
import createUserIngredientsRouter from "routes/userIngredients.routes";

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
        createUserIngredientsRouter(
            controllers.userIngredientsController,
            controllers.auth,
        ),
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
