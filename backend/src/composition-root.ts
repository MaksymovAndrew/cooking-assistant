import { buildCaloriesController } from "./composition-root.calories";
import { buildDietPreferencesControllers } from "./composition-root.dietPreferences";
import { buildFavouriteController } from "./composition-root.favourites";
import { buildMenuController } from "./composition-root.menu";
import { buildPantryController } from "./composition-root.pantry";
import { createPgDeps } from "./composition-root.pg";
import { buildRecipeController } from "./composition-root.recipe";
import { buildReferenceControllers } from "./composition-root.reference";
import { buildShoppingListController } from "./composition-root.shoppingList";
import { buildTagControllers } from "./composition-root.tags";
import type { Controllers, RepositoryDeps } from "./composition-root.types";
import { buildUserControllers } from "./composition-root.user";

export type { Controllers, RepositoryDeps };

export function buildControllers({
    ingredientRepository,
    recipeRepository,
    recipeTypeRepository,
    menuRepository,
    menuCategoryRepository,
    pantryRepository,
    userRepository,
    calorieRepository,
    favouriteRepository,
    dietPreferencesRepository,
    shoppingListRepository,
    tagRepository,
    passwordHasher,
    tokenService,
    emailSender,
    frontendOrigin,
}: RepositoryDeps): Controllers {
    const recipeController = buildRecipeController({
        recipeRepository,
        ingredientRepository,
    });

    const userControllers = buildUserControllers({
        userRepository,
        passwordHasher,
        tokenService,
        emailSender,
        frontendOrigin,
    });

    return {
        ...buildReferenceControllers({
            ingredientRepository,
            recipeTypeRepository,
            menuCategoryRepository,
        }),
        ...userControllers,
        recipeController,
        userIngredientsController: buildPantryController({
            pantryRepository,
            ingredientRepository,
        }),
        menuController: buildMenuController({
            menuRepository,
            recipeRepository,
        }),
        calorieController: buildCaloriesController(calorieRepository),
        favouriteController: buildFavouriteController(favouriteRepository),
        ...buildDietPreferencesControllers(dietPreferencesRepository),
        shoppingListController: buildShoppingListController({
            shoppingListRepository,
            ingredientRepository,
        }),
        ...buildTagControllers(tagRepository),
    };
}

const controllers = buildControllers(createPgDeps());

export default controllers;
