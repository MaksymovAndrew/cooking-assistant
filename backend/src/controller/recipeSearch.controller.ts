import type { RequestHandler } from "express";

import type GetAllRecipes from "application/use-cases/recipes/GetAllRecipes";
import type GetRecipeStats from "application/use-cases/recipes/GetRecipeStats";
import type SearchPersonRecipes from "application/use-cases/recipes/SearchPersonRecipes";
import type SearchRecipes from "application/use-cases/recipes/SearchRecipes";

import { getOptionalUserId, getUserId } from "./requestUser";

interface RecipeSearchControllerDependencies {
    getAllRecipes: GetAllRecipes;
    searchRecipes: SearchRecipes;
    searchPersonRecipes: SearchPersonRecipes;
    getRecipeStats: GetRecipeStats;
}

export default class RecipeSearchController {
    private getAllRecipesUseCase: GetAllRecipes;
    private searchRecipesUseCase: SearchRecipes;
    private searchPersonRecipesUseCase: SearchPersonRecipes;
    private getRecipeStatsUseCase: GetRecipeStats;

    constructor({
        getAllRecipes,
        searchRecipes,
        searchPersonRecipes,
        getRecipeStats,
    }: RecipeSearchControllerDependencies) {
        this.getAllRecipesUseCase = getAllRecipes;
        this.searchRecipesUseCase = searchRecipes;
        this.searchPersonRecipesUseCase = searchPersonRecipes;
        this.getRecipeStatsUseCase = getRecipeStats;
    }

    getAllRecipes: RequestHandler = async (_req, res) => {
        const recipes = await this.getAllRecipesUseCase.execute();

        res.json(recipes);
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

    getRecipesStats: RequestHandler = async (_req, res) => {
        const stats = await this.getRecipeStatsUseCase.execute();

        res.json(stats);
    };
}
