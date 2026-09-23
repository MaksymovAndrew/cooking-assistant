import PhotoCleanup from "application/media/PhotoCleanup";

import { createSessionAuth } from "middleware/jwtMiddleware";

import { buildCaloriesController } from "./composition-root.calories";
import { buildDietPreferencesControllers } from "./composition-root.dietPreferences";
import { buildFavouriteController } from "./composition-root.favourites";
import { buildMenuController } from "./composition-root.menu";
import { buildPantryController } from "./composition-root.pantry";
import { createPgDeps } from "./composition-root.pg";
import { buildPhotoControllers } from "./composition-root.photos";
import { buildRatingController } from "./composition-root.ratings";
import { buildRecipeControllers } from "./composition-root.recipe";
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
    ratingRepository,
    dietPreferencesRepository,
    shoppingListRepository,
    tagRepository,
    photoRepository,
    passwordHasher,
    tokenService,
    emailSender,
    imageProcessor,
    mediaStorage,
    frontendOrigin,
}: RepositoryDeps): Controllers {
    const photoCleanup = new PhotoCleanup(mediaStorage);
    const userControllers = buildUserControllers({
        userRepository,
        passwordHasher,
        tokenService,
        emailSender,
        frontendOrigin,
        photoCleanup,
    });

    return {
        auth: createSessionAuth(userRepository),
        ...buildReferenceControllers({
            ingredientRepository,
            recipeTypeRepository,
            menuCategoryRepository,
        }),
        ...userControllers,
        ...buildRecipeControllers({
            recipeRepository,
            ingredientRepository,
            photoCleanup,
        }),
        userIngredientsController: buildPantryController({
            pantryRepository,
            ingredientRepository,
        }),
        menuController: buildMenuController({
            menuRepository,
            recipeRepository,
            photoCleanup,
        }),
        calorieController: buildCaloriesController(calorieRepository),
        favouriteController: buildFavouriteController(favouriteRepository),
        ratingController: buildRatingController(ratingRepository),
        ...buildDietPreferencesControllers(dietPreferencesRepository),
        shoppingListController: buildShoppingListController({
            shoppingListRepository,
            ingredientRepository,
        }),
        ...buildTagControllers(tagRepository),
        ...buildPhotoControllers({
            photoRepository,
            imageProcessor,
            mediaStorage,
        }),
    };
}

const controllers = buildControllers(createPgDeps());

export default controllers;
