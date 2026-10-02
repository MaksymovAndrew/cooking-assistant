import type { RequestHandler } from "express";

import { requestLocale } from "i18n/requestLocale";
import { translateMessage } from "i18n/translate";

import type AddUserIngredients from "application/use-cases/pantry/AddUserIngredients";
import type DeleteUserIngredient from "application/use-cases/pantry/DeleteUserIngredient";
import type GetUserIngredients from "application/use-cases/pantry/GetUserIngredients";

import { requestBody } from "./requestBody";
import { getUserId } from "./requestUser";

interface UserIngredientsControllerDependencies {
    getUserIngredients: GetUserIngredients;
    addUserIngredients: AddUserIngredients;
    deleteUserIngredient: DeleteUserIngredient;
}

export default class UserIngredientsController {
    private getUserIngredientsUseCase: GetUserIngredients;
    private addUserIngredientsUseCase: AddUserIngredients;
    private deleteUserIngredientUseCase: DeleteUserIngredient;

    constructor({
        getUserIngredients,
        addUserIngredients,
        deleteUserIngredient,
    }: UserIngredientsControllerDependencies) {
        this.getUserIngredientsUseCase = getUserIngredients;
        this.addUserIngredientsUseCase = addUserIngredients;
        this.deleteUserIngredientUseCase = deleteUserIngredient;
    }

    getUserIngredients: RequestHandler = async (req, res) => {
        const ingredients = await this.getUserIngredientsUseCase.execute(
            getUserId(req),
        );

        res.json(ingredients);
    };

    updateUserIngredients: RequestHandler = async (req, res) => {
        const { ingredients } = requestBody(req);

        await this.addUserIngredientsUseCase.execute(
            getUserId(req),
            ingredients,
        );

        res.status(200).json({
            message: translateMessage("ingredientsUpdated", requestLocale(req)),
        });
    };

    deleteUserIngredient: RequestHandler<{ ingredientId: string }> = async (
        req,
        res,
    ) => {
        await this.deleteUserIngredientUseCase.execute(
            getUserId(req),
            req.params.ingredientId,
        );

        res.json({
            message: translateMessage("ingredientDeleted", requestLocale(req)),
        });
    };
}
