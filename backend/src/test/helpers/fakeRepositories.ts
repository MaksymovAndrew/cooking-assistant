import type { RepositoryDeps } from "composition-root";

import type { MenuCategoryRepository } from "domain/repositories/MenuCategoryRepository";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { PantryRepository } from "domain/repositories/PantryRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";
import type { RecipeTypeRepository } from "domain/repositories/RecipeTypeRepository";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";

export interface FakeRepositoryDeps extends RepositoryDeps {
    recipeRepository: jest.Mocked<RecipeRepository>;
    recipeTypeRepository: jest.Mocked<RecipeTypeRepository>;
    menuRepository: jest.Mocked<MenuRepository>;
    menuCategoryRepository: jest.Mocked<MenuCategoryRepository>;
    pantryRepository: jest.Mocked<PantryRepository>;
    userRepository: jest.Mocked<UserRepository>;
    passwordHasher: jest.Mocked<PasswordHasher>;
    tokenService: jest.Mocked<TokenService>;
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
        findAllIngredients: jest.fn(),
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
        updateQuantities: jest.fn(),
        updatePurchaseQuantity: jest.fn(),
        findPurchaseHistory: jest.fn(),
    };
}

function createUserRepository(): jest.Mocked<UserRepository> {
    return {
        findByLogin: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        findAll: jest.fn(),
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
    };
}

export function buildFakeDeps(): FakeRepositoryDeps {
    return {
        recipeRepository: createRecipeRepository(),
        recipeTypeRepository: { findAll: jest.fn() },
        menuRepository: createMenuRepository(),
        menuCategoryRepository: { findAll: jest.fn() },
        pantryRepository: createPantryRepository(),
        userRepository: createUserRepository(),
        passwordHasher: createPasswordHasher(),
        tokenService: createTokenService(),
    };
}
