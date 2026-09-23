import type { RepositoryDeps } from "composition-root";

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

import { TEST_FRONTEND_ORIGIN } from "test/helpers/testConstants";

export interface FakeRepositoryDeps extends RepositoryDeps {
    ingredientRepository: jest.Mocked<IngredientRepository>;
    recipeRepository: jest.Mocked<RecipeRepository>;
    recipeTypeRepository: jest.Mocked<RecipeTypeRepository>;
    menuRepository: jest.Mocked<MenuRepository>;
    menuCategoryRepository: jest.Mocked<MenuCategoryRepository>;
    pantryRepository: jest.Mocked<PantryRepository>;
    userRepository: jest.Mocked<UserRepository>;
    calorieRepository: jest.Mocked<CalorieRepository>;
    favouriteRepository: jest.Mocked<FavouriteRepository>;
    ratingRepository: jest.Mocked<RatingRepository>;
    dietPreferencesRepository: jest.Mocked<DietPreferencesRepository>;
    shoppingListRepository: jest.Mocked<ShoppingListRepository>;
    tagRepository: jest.Mocked<TagRepository>;
    photoRepository: jest.Mocked<PhotoRepository>;
    passwordHasher: jest.Mocked<PasswordHasher>;
    tokenService: jest.Mocked<TokenService>;
    emailSender: jest.Mocked<EmailSender>;
    imageProcessor: jest.Mocked<ImageProcessor>;
    mediaStorage: jest.Mocked<MediaStorage>;
}

function createIngredientRepository(): jest.Mocked<IngredientRepository> {
    return {
        findAll: jest.fn(),
        findExistingIds: jest.fn(),
    };
}

function createRecipeRepository(): jest.Mocked<RecipeRepository> {
    return {
        create: jest.fn(),
        findAllWithIngredients: jest.fn(),
        findByIdWithIngredients: jest.fn(),
        update: jest.fn(),
        deleteById: jest.fn(),
        search: jest.fn(),
        searchByPerson: jest.fn(),
        getStats: jest.fn(),
        findExistingIds: jest.fn(),
    };
}

function createMenuRepository(): jest.Mocked<MenuRepository> {
    return {
        findAll: jest.fn(),
        findAllUnpaginated: jest.fn(),
        create: jest.fn(),
        findByIdWithRecipes: jest.fn(),
        update: jest.fn(),
        deleteById: jest.fn(),
        searchByPerson: jest.fn(),
    };
}

function createPantryRepository(): jest.Mocked<PantryRepository> {
    return {
        findByUser: jest.fn(),
        addIngredients: jest.fn(),
        deleteIngredient: jest.fn(),
        updatePurchaseQuantity: jest.fn(),
        findPurchaseHistory: jest.fn(),
    };
}

function createUserRepository(): jest.Mocked<UserRepository> {
    return {
        findByLogin: jest.fn(),
        findById: jest.fn(),
        findByEmail: jest.fn(),
        findCredentialsById: jest.fn(),
        findCredentialsByEmail: jest.fn(),
        findPasswordResetCandidateByEmail: jest.fn(),
        create: jest.fn(),
        updatePassword: jest.fn(),
        updateProfile: jest.fn(),
        updateLocale: jest.fn(),
        markEmailVerified: jest.fn(),
        delete: jest.fn(),
        // matches the version authCookie() signs, so a test session stays live by default
        findSessionVersion: jest.fn((_id: number) =>
            Promise.resolve<number | null>(0),
        ),
    };
}

function createCalorieRepository(): jest.Mocked<CalorieRepository> {
    return {
        findIntake: jest.fn(),
        logIntake: jest.fn(),
        deleteIntake: jest.fn(),
        findRecipeCalories: jest.fn(),
        findMenuCalories: jest.fn(),
        updateGoal: jest.fn(),
    };
}

function createFavouriteRepository(): jest.Mocked<FavouriteRepository> {
    return {
        add: jest.fn(),
        remove: jest.fn(),
    };
}

function createRatingRepository(): jest.Mocked<RatingRepository> {
    return {
        rate: jest.fn(),
        remove: jest.fn(),
    };
}

function createDietPreferencesRepository(): jest.Mocked<DietPreferencesRepository> {
    return {
        findByPerson: jest.fn(),
        addAllergen: jest.fn(),
        removeAllergen: jest.fn(),
        addIngredient: jest.fn(),
        removeIngredient: jest.fn(),
    };
}

function createShoppingListRepository(): jest.Mocked<ShoppingListRepository> {
    return {
        findByPerson: jest.fn(),
        addItem: jest.fn(),
        updateItem: jest.fn(),
        deleteItem: jest.fn(),
        deleteChecked: jest.fn(),
        reorder: jest.fn(),
        addIngredients: jest.fn(),
    };
}

function createTagRepository(): jest.Mocked<TagRepository> {
    return {
        findByPerson: jest.fn(),
        create: jest.fn(),
        rename: jest.fn(),
        delete: jest.fn(),
        setRecipeTags: jest.fn(),
    };
}

function createPasswordHasher(): jest.Mocked<PasswordHasher> {
    return {
        hash: jest.fn(),
        compare: jest.fn(),
    };
}

function createTokenService(): jest.Mocked<TokenService> {
    return {
        generate: jest.fn(),
        generatePurposeToken: jest.fn(),
        verifyPurposeToken: jest.fn(),
    };
}

function createEmailSender(): jest.Mocked<EmailSender> {
    return {
        sendPasswordResetEmail: jest.fn(),
        sendVerificationEmail: jest.fn(),
    };
}

function createPhotoRepository(): jest.Mocked<PhotoRepository> {
    return {
        replace: jest.fn(),
    };
}

function createMediaStorage(): jest.Mocked<MediaStorage> {
    return {
        save: jest.fn(),
        remove: jest.fn(),
        locate: jest.fn(),
    };
}

export function buildFakeDeps(): FakeRepositoryDeps {
    return {
        ingredientRepository: createIngredientRepository(),
        recipeRepository: createRecipeRepository(),
        recipeTypeRepository: { findAll: jest.fn() },
        menuRepository: createMenuRepository(),
        menuCategoryRepository: { findAll: jest.fn() },
        pantryRepository: createPantryRepository(),
        userRepository: createUserRepository(),
        calorieRepository: createCalorieRepository(),
        favouriteRepository: createFavouriteRepository(),
        ratingRepository: createRatingRepository(),
        dietPreferencesRepository: createDietPreferencesRepository(),
        shoppingListRepository: createShoppingListRepository(),
        tagRepository: createTagRepository(),
        photoRepository: createPhotoRepository(),
        passwordHasher: createPasswordHasher(),
        tokenService: createTokenService(),
        emailSender: createEmailSender(),
        imageProcessor: { toVariants: jest.fn() },
        mediaStorage: createMediaStorage(),
        frontendOrigin: TEST_FRONTEND_ORIGIN,
    };
}
