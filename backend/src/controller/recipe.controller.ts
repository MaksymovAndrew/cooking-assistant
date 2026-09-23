import type { RequestHandler } from "express";

import { requestLocale } from "i18n/requestLocale";
import { translateMessage } from "i18n/translate";

import type CreateRecipe from "application/use-cases/recipes/CreateRecipe";
import type DeleteRecipe from "application/use-cases/recipes/DeleteRecipe";
import type GetRecipeById from "application/use-cases/recipes/GetRecipeById";
import type UpdateRecipe from "application/use-cases/recipes/UpdateRecipe";

import { getOptionalUserId, getUserId } from "./requestUser";

interface RecipeControllerDependencies {
    createRecipe: CreateRecipe;
    getRecipeById: GetRecipeById;
    updateRecipe: UpdateRecipe;
    deleteRecipe: DeleteRecipe;
}

export default class RecipeController {
    private createRecipeUseCase: CreateRecipe;
    private getRecipeByIdUseCase: GetRecipeById;
    private updateRecipeUseCase: UpdateRecipe;
    private deleteRecipeUseCase: DeleteRecipe;

    constructor({
        createRecipe,
        getRecipeById,
        updateRecipe,
        deleteRecipe,
    }: RecipeControllerDependencies) {
        this.createRecipeUseCase = createRecipe;
        this.getRecipeByIdUseCase = getRecipeById;
        this.updateRecipeUseCase = updateRecipe;
        this.deleteRecipeUseCase = deleteRecipe;
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

    deleteRecipe: RequestHandler<{ id: string }> = async (req, res) => {
        await this.deleteRecipeUseCase.execute(req.params.id, getUserId(req));

        res.json({
            message: translateMessage("recipeDeleted", requestLocale(req)),
        });
    };
}
