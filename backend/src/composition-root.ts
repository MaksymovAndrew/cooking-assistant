import PhotoCleanup from "application/media/PhotoCleanup";
import CheckHealth from "application/use-cases/health/CheckHealth";

import HealthController from "controller/health.controller";
import { createSessionAuth } from "middleware/jwtMiddleware";

import { buildCaloriesController } from "./composition-root.calories";
import { buildDietPreferencesControllers } from "./composition-root.dietPreferences";
import { buildFavouriteController } from "./composition-root.favourites";
import { buildMenuController } from "./composition-root.menu";
import { buildPantryControllers } from "./composition-root.pantry";
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

export function buildControllers(deps: RepositoryDeps): Controllers {
    const photoCleanup = new PhotoCleanup(deps.mediaStorage);

    return {
        auth: createSessionAuth(deps.userRepository),
        healthController: new HealthController({
            checkHealth: new CheckHealth(deps.databaseProbe),
        }),
        ...buildReferenceControllers(deps),
        ...buildUserControllers({ ...deps, photoCleanup }),
        ...buildRecipeControllers({ ...deps, photoCleanup }),
        ...buildPantryControllers(deps),
        menuController: buildMenuController({ ...deps, photoCleanup }),
        calorieController: buildCaloriesController(deps.calorieRepository),
        favouriteController: buildFavouriteController(deps.favouriteRepository),
        ratingController: buildRatingController(deps.ratingRepository),
        ...buildDietPreferencesControllers(deps.dietPreferencesRepository),
        shoppingListController: buildShoppingListController(deps),
        ...buildTagControllers(deps.tagRepository),
        ...buildPhotoControllers(deps),
    };
}

const controllers = buildControllers(createPgDeps());

export default controllers;
