import type { CalorieRepository } from "domain/repositories/CalorieRepository";
import type { DietPreferencesRepository } from "domain/repositories/DietPreferencesRepository";
import type { FavouriteRepository } from "domain/repositories/FavouriteRepository";
import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { MenuCategoryRepository } from "domain/repositories/MenuCategoryRepository";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { PantryRepository } from "domain/repositories/PantryRepository";
import type { PhotoRepository } from "domain/repositories/PhotoRepository";
import type { RatingRepository } from "domain/repositories/RatingRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";
import type { RecipeTypeRepository } from "domain/repositories/RecipeTypeRepository";
import type { ShoppingListRepository } from "domain/repositories/ShoppingListRepository";
import type { TagRepository } from "domain/repositories/TagRepository";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { EmailSender } from "application/ports/EmailSender";
import type { ImageProcessor } from "application/ports/ImageProcessor";
import type { MediaStorage } from "application/ports/MediaStorage";
import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";

import type CalorieController from "controller/calorie.controller";
import type FavouriteController from "controller/favourite.controller";
import type MenuController from "controller/menu.controller";
import type RatingController from "controller/rating.controller";
import type RecipeController from "controller/recipe.controller";
import type ShoppingListController from "controller/shoppingList.controller";
import type UserIngredientsController from "controller/userIngredients.controller";

import type { DietPreferencesControllers } from "./composition-root.dietPreferences";
import type { PhotoControllers } from "./composition-root.photos";
import type { ReferenceControllers } from "./composition-root.reference";
import type { TagControllers } from "./composition-root.tags";
import type { UserControllers } from "./composition-root.user";

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
    ratingRepository: RatingRepository;
    dietPreferencesRepository: DietPreferencesRepository;
    shoppingListRepository: ShoppingListRepository;
    tagRepository: TagRepository;
    photoRepository: PhotoRepository;
    passwordHasher: PasswordHasher;
    tokenService: TokenService;
    emailSender: EmailSender;
    imageProcessor: ImageProcessor;
    mediaStorage: MediaStorage;
    frontendOrigin: string;
}

export interface Controllers
    extends
        ReferenceControllers,
        DietPreferencesControllers,
        TagControllers,
        UserControllers,
        PhotoControllers {
    recipeController: RecipeController;
    userIngredientsController: UserIngredientsController;
    menuController: MenuController;
    calorieController: CalorieController;
    favouriteController: FavouriteController;
    ratingController: RatingController;
    shoppingListController: ShoppingListController;
}
