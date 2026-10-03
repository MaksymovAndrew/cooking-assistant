import type { RequestHandler } from "express";

import type GetRecipeStats from "application/use-cases/recipes/GetRecipeStats";
import type SearchPersonRecipes from "application/use-cases/recipes/SearchPersonRecipes";
import type SearchRecipes from "application/use-cases/recipes/SearchRecipes";

import { getOptionalUserId, getUserId } from "./requestUser";

interface RecipeSearchControllerDependencies {
    searchRecipes: SearchRecipes;
    searchPersonRecipes: SearchPersonRecipes;
    getRecipeStats: GetRecipeStats;
}

export default class RecipeSearchController {
    private searchRecipesUseCase: SearchRecipes;
    private searchPersonRecipesUseCase: SearchPersonRecipes;
    private getRecipeStatsUseCase: GetRecipeStats;

    constructor({
        searchRecipes,
        searchPersonRecipes,
        getRecipeStats,
    }: RecipeSearchControllerDependencies) {
        this.searchRecipesUseCase = searchRecipes;
        this.searchPersonRecipesUseCase = searchPersonRecipes;
        this.getRecipeStatsUseCase = getRecipeStats;
    }

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
