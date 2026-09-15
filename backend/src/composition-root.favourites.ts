import type { FavouriteRepository } from "domain/repositories/FavouriteRepository";

import AddFavourite from "application/use-cases/favourites/AddFavourite";
import RemoveFavourite from "application/use-cases/favourites/RemoveFavourite";

import FavouriteController from "controller/favourite.controller";

export function buildFavouriteController(
    favouriteRepository: FavouriteRepository,
): FavouriteController {
    return new FavouriteController({
        addRecipeFavourite: new AddFavourite(favouriteRepository, "recipe"),
        removeRecipeFavourite: new RemoveFavourite(
            favouriteRepository,
            "recipe",
        ),
        addMenuFavourite: new AddFavourite(favouriteRepository, "menu"),
        removeMenuFavourite: new RemoveFavourite(favouriteRepository, "menu"),
    });
}
