import { config } from "config/env";

import { createEmailSender } from "infrastructure/email/createEmailSender";
import LocalDiskMediaStorage from "infrastructure/media/LocalDiskMediaStorage";
import SharpImageProcessor from "infrastructure/media/SharpImageProcessor";
import PgCalorieRepository from "infrastructure/persistence/pg/PgCalorieRepository";
import PgDietPreferencesRepository from "infrastructure/persistence/pg/PgDietPreferencesRepository";
import PgFavouriteRepository from "infrastructure/persistence/pg/PgFavouriteRepository";
import PgIngredientRepository from "infrastructure/persistence/pg/PgIngredientRepository";
import PgMenuCategoryRepository from "infrastructure/persistence/pg/PgMenuCategoryRepository";
import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
import PgPantryRepository from "infrastructure/persistence/pg/PgPantryRepository";
import PgPhotoRepository from "infrastructure/persistence/pg/PgPhotoRepository";
import PgRatingRepository from "infrastructure/persistence/pg/PgRatingRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";
import PgRecipeTypeRepository from "infrastructure/persistence/pg/PgRecipeTypeRepository";
import PgShoppingListRepository from "infrastructure/persistence/pg/PgShoppingListRepository";
import PgTagRepository from "infrastructure/persistence/pg/PgTagRepository";
import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";
import BcryptPasswordHasher from "infrastructure/security/BcryptPasswordHasher";
import JwtTokenService from "infrastructure/security/JwtTokenService";

import type { RepositoryDeps } from "./composition-root";
import pool from "./db";

// the real adapters behind every port; buildControllers itself stays free of them so tests can pass fakes
export function createPgDeps(): RepositoryDeps {
    return {
        ingredientRepository: new PgIngredientRepository(pool),
        recipeRepository: new PgRecipeRepository(pool),
        recipeTypeRepository: new PgRecipeTypeRepository(pool),
        menuRepository: new PgMenuRepository(pool),
        menuCategoryRepository: new PgMenuCategoryRepository(pool),
        pantryRepository: new PgPantryRepository(pool),
        userRepository: new PgUserRepository(pool),
        calorieRepository: new PgCalorieRepository(pool),
        favouriteRepository: new PgFavouriteRepository(pool),
        ratingRepository: new PgRatingRepository(pool),
        dietPreferencesRepository: new PgDietPreferencesRepository(pool),
        shoppingListRepository: new PgShoppingListRepository(pool),
        tagRepository: new PgTagRepository(pool),
        photoRepository: new PgPhotoRepository(pool),
        passwordHasher: new BcryptPasswordHasher(),
        tokenService: new JwtTokenService(),
        emailSender: createEmailSender(config.resendApiKey, config.emailFrom),
        imageProcessor: new SharpImageProcessor(),
        mediaStorage: new LocalDiskMediaStorage(config.mediaDir),
        frontendOrigin: config.corsOrigin,
    };
}
