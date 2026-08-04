import type { RequestHandler } from "express";

import { SUCCESS_MESSAGES } from "constants/errorMessages";

import type CreateRecipe from "application/use-cases/recipes/CreateRecipe";
import type DeleteRecipe from "application/use-cases/recipes/DeleteRecipe";
import type GetAllRecipes from "application/use-cases/recipes/GetAllRecipes";
import type GetRecipeById from "application/use-cases/recipes/GetRecipeById";
import type GetRecipeStats from "application/use-cases/recipes/GetRecipeStats";
import type SearchPersonRecipes from "application/use-cases/recipes/SearchPersonRecipes";
import type SearchRecipes from "application/use-cases/recipes/SearchRecipes";
import type UpdateRecipe from "application/use-cases/recipes/UpdateRecipe";

import { getOptionalUserId, getUserId } from "./requestUser";

interface RecipeControllerDependencies {
    createRecipe: CreateRecipe;
    getAllRecipes: GetAllRecipes;
    getRecipeById: GetRecipeById;
    updateRecipe: UpdateRecipe;
    deleteRecipe: DeleteRecipe;
    searchRecipes: SearchRecipes;
    searchPersonRecipes: SearchPersonRecipes;
    getRecipeStats: GetRecipeStats;
}

export default class RecipeController {
    private createRecipeUseCase: CreateRecipe;
    private getAllRecipesUseCase: GetAllRecipes;
    private getRecipeByIdUseCase: GetRecipeById;
    private updateRecipeUseCase: UpdateRecipe;
    private deleteRecipeUseCase: DeleteRecipe;
    private searchRecipesUseCase: SearchRecipes;
    private searchPersonRecipesUseCase: SearchPersonRecipes;
    private getRecipeStatsUseCase: GetRecipeStats;

    constructor({
        createRecipe,
        getAllRecipes,
        getRecipeById,
        updateRecipe,
        deleteRecipe,
        searchRecipes,
        searchPersonRecipes,
        getRecipeStats,
    }: RecipeControllerDependencies) {
        this.createRecipeUseCase = createRecipe;
        this.getAllRecipesUseCase = getAllRecipes;
        this.getRecipeByIdUseCase = getRecipeById;
        this.updateRecipeUseCase = updateRecipe;
        this.deleteRecipeUseCase = deleteRecipe;
        this.searchRecipesUseCase = searchRecipes;
        this.searchPersonRecipesUseCase = searchPersonRecipes;
        this.getRecipeStatsUseCase = getRecipeStats;
    }

    createRecipe: RequestHandler = async (req, res) => {
        const body = req.body as Record<string, unknown>;
        const person_id = getUserId(req);
        const created = await this.createRecipeUseCase.execute({
            ...body,
            person_id,
        });

        res.json(created);
    };

    getAllRecipes: RequestHandler = async (_req, res) => {
        const recipes = await this.getAllRecipesUseCase.execute();

        res.json(recipes);
    };

    getRecipeWithIngredients: RequestHandler<{ id: string }> = async (
        req,
        res,
    ) => {
        const recipe = await this.getRecipeByIdUseCase.execute(
            req.params.id,
            getOptionalUserId(req),
        );

        res.json(recipe);
    };

    updateRecipe: RequestHandler<{ id: string }> = async (req, res) => {
        const person_id = getUserId(req);
        const body = req.body as Record<string, unknown>;
        const updated = await this.updateRecipeUseCase.execute(
            req.params.id,
            person_id,
            body,
        );

        res.json(updated);
    };

    searchRecipes: RequestHandler = async (req, res) => {
        const recipes = await this.searchRecipesUseCase.execute(
            getOptionalUserId(req),
            req.query,
        );

        res.json(recipes);
    };

    searchPersonRecipes: RequestHandler = async (req, res) => {
        const person_id = getUserId(req);
        const recipes = await this.searchPersonRecipesUseCase.execute(
            person_id,
            req.query,
        );

        res.json(recipes);
    };

    deleteRecipe: RequestHandler<{ id: string }> = async (req, res) => {
        await this.deleteRecipeUseCase.execute(req.params.id, getUserId(req));

        res.json({ message: SUCCESS_MESSAGES.RECIPE_DELETED });
    };

    getRecipesStats: RequestHandler = async (_req, res) => {
        const stats = await this.getRecipeStatsUseCase.execute();

        res.json(stats);
    };
}
