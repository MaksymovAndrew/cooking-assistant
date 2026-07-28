import { config } from "config/env";
import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { MenuCategoryRepository } from "domain/repositories/MenuCategoryRepository";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { PantryRepository } from "domain/repositories/PantryRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";
import type { RecipeTypeRepository } from "domain/repositories/RecipeTypeRepository";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { EmailSender } from "application/ports/EmailSender";
import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";
import GetAllIngredients from "application/use-cases/ingredients/GetAllIngredients";
import GetAllMenuCategories from "application/use-cases/menu-categories/GetAllMenuCategories";
import CreateMenu from "application/use-cases/menus/CreateMenu";
import DeleteMenu from "application/use-cases/menus/DeleteMenu";
import GetAllMenus from "application/use-cases/menus/GetAllMenus";
import GetAllMenusUnpaginated from "application/use-cases/menus/GetAllMenusUnpaginated";
import GetMenuById from "application/use-cases/menus/GetMenuById";
import SearchPersonMenus from "application/use-cases/menus/SearchPersonMenus";
import UpdateMenu from "application/use-cases/menus/UpdateMenu";
import AddUserIngredients from "application/use-cases/pantry/AddUserIngredients";
import DeleteUserIngredient from "application/use-cases/pantry/DeleteUserIngredient";
import GetPurchaseHistory from "application/use-cases/pantry/GetPurchaseHistory";
import GetUserIngredients from "application/use-cases/pantry/GetUserIngredients";
import UpdateIngredientQuantities from "application/use-cases/pantry/UpdateIngredientQuantities";
import UpdatePurchaseQuantity from "application/use-cases/pantry/UpdatePurchaseQuantity";
import GetAllRecipeTypes from "application/use-cases/recipe-types/GetAllRecipeTypes";

import { createEmailSender } from "infrastructure/email/createEmailSender";
import PgIngredientRepository from "infrastructure/persistence/pg/PgIngredientRepository";
import PgMenuCategoryRepository from "infrastructure/persistence/pg/PgMenuCategoryRepository";
import PgMenuRepository from "infrastructure/persistence/pg/PgMenuRepository";
import PgPantryRepository from "infrastructure/persistence/pg/PgPantryRepository";
import PgRecipeRepository from "infrastructure/persistence/pg/PgRecipeRepository";
import PgRecipeTypeRepository from "infrastructure/persistence/pg/PgRecipeTypeRepository";
import PgUserRepository from "infrastructure/persistence/pg/PgUserRepository";
import BcryptPasswordHasher from "infrastructure/security/BcryptPasswordHasher";
import JwtTokenService from "infrastructure/security/JwtTokenService";

import IngredientController from "controller/ingredient.controller";
import MenuController from "controller/menu.controller";
import MenuCategoryController from "controller/menuCategory.controller";
import type RecipeController from "controller/recipe.controller";
import RecipeTypeController from "controller/type.controller";
import type UserController from "controller/user.controller";
import UserIngredientsController from "controller/userIngredients.controller";

import { buildRecipeController } from "./composition-root.recipe";
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
    passwordHasher: PasswordHasher;
    tokenService: TokenService;
    emailSender: EmailSender;
    frontendOrigin: string;
}

export interface Controllers {
    userController: UserController;
    ingredientController: IngredientController;
    recipeController: RecipeController;
    recipeTypeController: RecipeTypeController;
    userIngredientsController: UserIngredientsController;
    menuController: MenuController;
    menuCategoryController: MenuCategoryController;
}

export function buildControllers({
    ingredientRepository,
    recipeRepository,
    recipeTypeRepository,
    menuRepository,
    menuCategoryRepository,
    pantryRepository,
    userRepository,
    passwordHasher,
    tokenService,
    emailSender,
    frontendOrigin,
}: RepositoryDeps): Controllers {
    const ingredientController = new IngredientController({
        getAllIngredients: new GetAllIngredients(ingredientRepository),
    });

    const recipeTypeController = new RecipeTypeController({
        getAllRecipeTypes: new GetAllRecipeTypes(recipeTypeRepository),
    });

    const recipeController = buildRecipeController({
        recipeRepository,
        ingredientRepository,
    });

    const menuController = new MenuController({
        getAllMenus: new GetAllMenus(menuRepository),
        getAllMenusUnpaginated: new GetAllMenusUnpaginated(menuRepository),
        createMenu: new CreateMenu(menuRepository, recipeRepository),
        getMenuById: new GetMenuById(menuRepository),
        updateMenu: new UpdateMenu(menuRepository, recipeRepository),
        deleteMenu: new DeleteMenu(menuRepository),
        searchPersonMenus: new SearchPersonMenus(menuRepository),
    });

    const menuCategoryController = new MenuCategoryController({
        getAllMenuCategories: new GetAllMenuCategories(menuCategoryRepository),
    });

    const userIngredientsController = new UserIngredientsController({
        getUserIngredients: new GetUserIngredients(pantryRepository),
        addUserIngredients: new AddUserIngredients(pantryRepository),
        deleteUserIngredient: new DeleteUserIngredient(pantryRepository),
        updateIngredientQuantities: new UpdateIngredientQuantities(
            pantryRepository,
        ),
        updatePurchaseQuantity: new UpdatePurchaseQuantity(pantryRepository),
        getPurchaseHistory: new GetPurchaseHistory(pantryRepository),
    });

    const userController = buildUserController({
        userRepository,
        passwordHasher,
        tokenService,
        emailSender,
        frontendOrigin,
    });

    return {
        userController,
        ingredientController,
        recipeController,
        recipeTypeController,
        userIngredientsController,
        menuController,
        menuCategoryController,
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
    passwordHasher: new BcryptPasswordHasher(),
    tokenService: new JwtTokenService(),
    emailSender: createEmailSender(config.resendApiKey, config.emailFrom),
    frontendOrigin: config.corsOrigin,
});

export default controllers;
