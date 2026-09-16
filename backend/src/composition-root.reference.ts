import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { MenuCategoryRepository } from "domain/repositories/MenuCategoryRepository";
import type { RecipeTypeRepository } from "domain/repositories/RecipeTypeRepository";

import GetAllIngredients from "application/use-cases/ingredients/GetAllIngredients";
import GetAllMenuCategories from "application/use-cases/menu-categories/GetAllMenuCategories";
import GetAllRecipeTypes from "application/use-cases/recipe-types/GetAllRecipeTypes";

import IngredientController from "controller/ingredient.controller";
import MenuCategoryController from "controller/menuCategory.controller";
import RecipeTypeController from "controller/type.controller";

interface ReferenceControllerDeps {
    ingredientRepository: IngredientRepository;
    recipeTypeRepository: RecipeTypeRepository;
    menuCategoryRepository: MenuCategoryRepository;
}

interface ReferenceControllers {
    ingredientController: IngredientController;
    recipeTypeController: RecipeTypeController;
    menuCategoryController: MenuCategoryController;
}

// the read-only catalog lists; split out of composition-root.ts to keep it under the line-count lint cap
export function buildReferenceControllers({
    ingredientRepository,
    recipeTypeRepository,
    menuCategoryRepository,
}: ReferenceControllerDeps): ReferenceControllers {
    return {
        ingredientController: new IngredientController({
            getAllIngredients: new GetAllIngredients(ingredientRepository),
        }),
        recipeTypeController: new RecipeTypeController({
            getAllRecipeTypes: new GetAllRecipeTypes(recipeTypeRepository),
        }),
        menuCategoryController: new MenuCategoryController({
            getAllMenuCategories: new GetAllMenuCategories(
                menuCategoryRepository,
            ),
        }),
    };
}
