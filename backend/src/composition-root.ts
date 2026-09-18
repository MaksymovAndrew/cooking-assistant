import { config } from "config/env";
import type { CalorieRepository } from "domain/repositories/CalorieRepository";
import type { DietPreferencesRepository } from "domain/repositories/DietPreferencesRepository";
import type { FavouriteRepository } from "domain/repositories/FavouriteRepository";
import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { MenuCategoryRepository } from "domain/repositories/MenuCategoryRepository";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { PantryRepository } from "domain/repositories/PantryRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";
import type { RecipeTypeRepository } from "domain/repositories/RecipeTypeRepository";
import type { ShoppingListRepository } from "domain/repositories/ShoppingListRepository";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { EmailSender } from "application/ports/EmailSender";
import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";

import { createEmailSender } from "infrastructure/email/createEmailSender";
import PgCalorieRepository from "infrastructure/persistence/pg/PgCalorieRepository";
import PgDietPreferencesRepository from "infrastructure/persistence/pg/PgDietPreferencesRepository";
import PgFavouriteRepository from "infrastructure/persistence/pg/PgFavouriteRepository";
import PgIngredientRepository from "infrastructure/persistence/pg/PgIngredientRepository";
import PgMenuCategoryRepository from "infrastructure/persistence/pg/PgMenuCategoryRepository";
import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
import PgPantryRepository from "infrastructure/persistence/pg/PgPantryRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";
import PgRecipeTypeRepository from "infrastructure/persistence/pg/PgRecipeTypeRepository";
import PgShoppingListRepository from "infrastructure/persistence/pg/PgShoppingListRepository";
import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";
import BcryptPasswordHasher from "infrastructure/security/BcryptPasswordHasher";
import JwtTokenService from "infrastructure/security/JwtTokenService";

import type CalorieController from "controller/calorie.controller";
import type FavouriteController from "controller/favourite.controller";
import type MenuController from "controller/menu.controller";
import type RecipeController from "controller/recipe.controller";
import type ShoppingListController from "controller/shoppingList.controller";
import type UserController from "controller/user.controller";
import type UserIngredientsController from "controller/userIngredients.controller";

import { buildCaloriesController } from "./composition-root.calories";
import {
    buildDietPreferencesControllers,
    type DietPreferencesControllers,
} from "./composition-root.dietPreferences";
import { buildFavouriteController } from "./composition-root.favourites";
import { buildMenuController } from "./composition-root.menu";
import { buildPantryController } from "./composition-root.pantry";
import { buildRecipeController } from "./composition-root.recipe";
import {
    buildReferenceControllers,
    type ReferenceControllers,
} from "./composition-root.reference";
import { buildShoppingListController } from "./composition-root.shoppingList";
import { buildUserController } from "./composition-root.user";
import pool from "./db";

export interface RepositoryDeps {
    ingredientRepository: IngredientRepository;
    recipeRepository: RecipeRepository;
    recipeTypeRepository: RecipeTypeRepository;
    menuRepository: MenuRepository;
    menuCategoryRepository: MenuCategoryRepository;
    pantryRepository: PantryRepository;
    userRepository: UserRepository;
    calorieRepository: CalorieRepository;
    favouriteRepository: FavouriteRepository;
    dietPreferencesRepository: DietPreferencesRepository;
    shoppingListRepository: ShoppingListRepository;
    passwordHasher: PasswordHasher;
    tokenService: TokenService;
    emailSender: EmailSender;
    frontendOrigin: string;
}

export interface Controllers
    extends ReferenceControllers, DietPreferencesControllers {
    userController: UserController;
    recipeController: RecipeController;
    userIngredientsController: UserIngredientsController;
    menuController: MenuController;
    calorieController: CalorieController;
    favouriteController: FavouriteController;
    shoppingListController: ShoppingListController;
}

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
    passwordHasher,
    tokenService,
    emailSender,
    frontendOrigin,
}: RepositoryDeps): Controllers {
    const recipeController = buildRecipeController({
        recipeRepository,
        ingredientRepository,
    });

    const userController = buildUserController({
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
        userController,
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
    };
}

const controllers = buildControllers({
    ingredientRepository: new PgIngredientRepository(pool),
    recipeRepository: new PgRecipeRepository(pool),
    recipeTypeRepository: new PgRecipeTypeRepository(pool),
    menuRepository: new PgMenuRepository(pool),
    menuCategoryRepository: new PgMenuCategoryRepository(pool),
    pantryRepository: new PgPantryRepository(pool),
    userRepository: new PgUserRepository(pool),
    calorieRepository: new PgCalorieRepository(pool),
    favouriteRepository: new PgFavouriteRepository(pool),
    dietPreferencesRepository: new PgDietPreferencesRepository(pool),
    shoppingListRepository: new PgShoppingListRepository(pool),
    passwordHasher: new BcryptPasswordHasher(),
    tokenService: new JwtTokenService(),
    emailSender: createEmailSender(config.resendApiKey, config.emailFrom),
    frontendOrigin: config.corsOrigin,
});

export default controllers;
