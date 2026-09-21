import type { RatingRepository } from "domain/repositories/RatingRepository";

import RateRecord from "application/use-cases/ratings/RateRecord";
import RemoveRating from "application/use-cases/ratings/RemoveRating";

import RatingController from "controller/rating.controller";

export function buildRatingController(
    ratingRepository: RatingRepository,
): RatingController {
    return new RatingController({
        rateRecipe: new RateRecord(ratingRepository, "recipe"),
        removeRecipeRating: new RemoveRating(ratingRepository, "recipe"),
        rateMenu: new RateRecord(ratingRepository, "menu"),
        removeMenuRating: new RemoveRating(ratingRepository, "menu"),
    });
}
