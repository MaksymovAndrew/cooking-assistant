import type { RequestHandler } from "express";

import type AddFavourite from "application/use-cases/favourites/AddFavourite";
import type RemoveFavourite from "application/use-cases/favourites/RemoveFavourite";

import { getUserId } from "./requestUser";

interface FavouriteControllerDependencies {
    addRecipeFavourite: AddFavourite;
    removeRecipeFavourite: RemoveFavourite;
    addMenuFavourite: AddFavourite;
    removeMenuFavourite: RemoveFavourite;
}

// PUT and DELETE are idempotent toggles with nothing to return, so every handler answers 204
export default class FavouriteController {
    private addRecipeFavouriteUseCase: AddFavourite;
    private removeRecipeFavouriteUseCase: RemoveFavourite;
    private addMenuFavouriteUseCase: AddFavourite;
    private removeMenuFavouriteUseCase: RemoveFavourite;

    constructor({
        addRecipeFavourite,
        removeRecipeFavourite,
        addMenuFavourite,
        removeMenuFavourite,
    }: FavouriteControllerDependencies) {
        this.addRecipeFavouriteUseCase = addRecipeFavourite;
        this.removeRecipeFavouriteUseCase = removeRecipeFavourite;
        this.addMenuFavouriteUseCase = addMenuFavourite;
        this.removeMenuFavouriteUseCase = removeMenuFavourite;
    }

    addRecipeFavourite: RequestHandler<{ id: string }> = async (req, res) => {
        await this.addRecipeFavouriteUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };

    removeRecipeFavourite: RequestHandler<{ id: string }> = async (
        req,
        res,
    ) => {
        await this.removeRecipeFavouriteUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };

    addMenuFavourite: RequestHandler<{ id: string }> = async (req, res) => {
        await this.addMenuFavouriteUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };

    removeMenuFavourite: RequestHandler<{ id: string }> = async (req, res) => {
        await this.removeMenuFavouriteUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };
}
