import type { RequestHandler } from "express";

import type AddAvoidedAllergen from "application/use-cases/diet-preferences/AddAvoidedAllergen";
import type AddAvoidedIngredient from "application/use-cases/diet-preferences/AddAvoidedIngredient";
import type GetDietPreferences from "application/use-cases/diet-preferences/GetDietPreferences";
import type RemoveAvoidedAllergen from "application/use-cases/diet-preferences/RemoveAvoidedAllergen";
import type RemoveAvoidedIngredient from "application/use-cases/diet-preferences/RemoveAvoidedIngredient";

import { getUserId } from "./requestUser";

interface DietPreferencesControllerDependencies {
    getDietPreferences: GetDietPreferences;
    addAvoidedAllergen: AddAvoidedAllergen;
    removeAvoidedAllergen: RemoveAvoidedAllergen;
    addAvoidedIngredient: AddAvoidedIngredient;
    removeAvoidedIngredient: RemoveAvoidedIngredient;
}

// every write is an idempotent toggle with nothing to return, so each answers 204
export default class DietPreferencesController {
    private getDietPreferencesUseCase: GetDietPreferences;
    private addAvoidedAllergenUseCase: AddAvoidedAllergen;
    private removeAvoidedAllergenUseCase: RemoveAvoidedAllergen;
    private addAvoidedIngredientUseCase: AddAvoidedIngredient;
    private removeAvoidedIngredientUseCase: RemoveAvoidedIngredient;

    constructor({
        getDietPreferences,
        addAvoidedAllergen,
        removeAvoidedAllergen,
        addAvoidedIngredient,
        removeAvoidedIngredient,
    }: DietPreferencesControllerDependencies) {
        this.getDietPreferencesUseCase = getDietPreferences;
        this.addAvoidedAllergenUseCase = addAvoidedAllergen;
        this.removeAvoidedAllergenUseCase = removeAvoidedAllergen;
        this.addAvoidedIngredientUseCase = addAvoidedIngredient;
        this.removeAvoidedIngredientUseCase = removeAvoidedIngredient;
    }

    getDietPreferences: RequestHandler = async (req, res) => {
        const preferences = await this.getDietPreferencesUseCase.execute(
            getUserId(req),
        );

        res.status(200).json(preferences);
    };

    addAvoidedAllergen: RequestHandler<{ slug: string }> = async (req, res) => {
        await this.addAvoidedAllergenUseCase.execute(
            getUserId(req),
            req.params.slug,
        );

        res.status(204).end();
    };

    removeAvoidedAllergen: RequestHandler<{ slug: string }> = async (
        req,
        res,
    ) => {
        await this.removeAvoidedAllergenUseCase.execute(
            getUserId(req),
            req.params.slug,
        );

        res.status(204).end();
    };

    addAvoidedIngredient: RequestHandler<{ id: string }> = async (req, res) => {
        await this.addAvoidedIngredientUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };

    removeAvoidedIngredient: RequestHandler<{ id: string }> = async (
        req,
        res,
    ) => {
        await this.removeAvoidedIngredientUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };
}
