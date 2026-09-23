import { FAVOURITE_TARGET } from "constants/favourites";

import { cardFavourite, cardRating } from "components/cards/ContentCard";

describe("cardRating", () => {
    it("should build the rating from the totals the list carries", () => {
        expect(
            cardRating({ id: 1, ratingAverage: 4.5, ratingCount: 2 }),
        ).toEqual({ average: 4.5, count: 2 });
    });

    it("should keep an unrated record's average null", () => {
        expect(cardRating({ id: 1, ratingCount: 0 })).toEqual({
            average: null,
            count: 0,
        });
    });

    it("should return null where the list carries no rating totals", () => {
        expect(cardRating({ id: 1 })).toBeNull();
    });
});

describe("cardFavourite", () => {
    it("should build the heart state for a signed-in viewer", () => {
        expect(
            cardFavourite(FAVOURITE_TARGET.menu, { id: 3, isFavourite: true }),
        ).toEqual({ target: FAVOURITE_TARGET.menu, id: 3, isFavourite: true });
    });

    it("should return null for an anonymous viewer", () => {
        expect(
            cardFavourite(FAVOURITE_TARGET.recipe, {
                id: 3,
                isFavourite: null,
            }),
        ).toBeNull();
    });
});
