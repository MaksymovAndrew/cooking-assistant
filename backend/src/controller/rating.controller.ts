import type { RequestHandler } from "express";

import type RateRecord from "application/use-cases/ratings/RateRecord";
import type RemoveRating from "application/use-cases/ratings/RemoveRating";

import { getUserId } from "./requestUser";

interface RatingControllerDependencies {
    rateRecipe: RateRecord;
    removeRecipeRating: RemoveRating;
    rateMenu: RateRecord;
    removeMenuRating: RemoveRating;
}

// PUT and DELETE are idempotent with nothing to return - the new average arrives with the refetched record
export default class RatingController {
    private rateRecipeUseCase: RateRecord;
    private removeRecipeRatingUseCase: RemoveRating;
    private rateMenuUseCase: RateRecord;
    private removeMenuRatingUseCase: RemoveRating;

    constructor({
        rateRecipe,
        removeRecipeRating,
        rateMenu,
        removeMenuRating,
    }: RatingControllerDependencies) {
        this.rateRecipeUseCase = rateRecipe;
        this.removeRecipeRatingUseCase = removeRecipeRating;
        this.rateMenuUseCase = rateMenu;
        this.removeMenuRatingUseCase = removeMenuRating;
    }

    rateRecipe: RequestHandler<{ id: string }> = async (req, res) => {
        await this.rateRecipeUseCase.execute(
            getUserId(req),
            req.params.id,
            req.body,
        );

        res.status(204).end();
    };

    removeRecipeRating: RequestHandler<{ id: string }> = async (req, res) => {
        await this.removeRecipeRatingUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };

    rateMenu: RequestHandler<{ id: string }> = async (req, res) => {
        await this.rateMenuUseCase.execute(
            getUserId(req),
            req.params.id,
            req.body,
        );

        res.status(204).end();
    };

    removeMenuRating: RequestHandler<{ id: string }> = async (req, res) => {
        await this.removeMenuRatingUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };
}
