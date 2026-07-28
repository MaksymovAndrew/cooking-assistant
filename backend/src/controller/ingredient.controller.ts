import type { RequestHandler } from "express";

import type GetAllIngredients from "application/use-cases/ingredients/GetAllIngredients";

interface IngredientControllerDependencies {
    getAllIngredients: GetAllIngredients;
}

export default class IngredientController {
    private getAllIngredientsUseCase: GetAllIngredients;

    constructor({ getAllIngredients }: IngredientControllerDependencies) {
        this.getAllIngredientsUseCase = getAllIngredients;
    }

    getAll: RequestHandler = async (_req, res) => {
        const ingredients = await this.getAllIngredientsUseCase.execute();

        res.json(ingredients);
    };
}
