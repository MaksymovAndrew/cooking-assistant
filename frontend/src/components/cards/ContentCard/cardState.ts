import type { FavouriteTarget } from "constants/favourites";

import type {
    ContentCardFavouriteState,
    ContentCardRating,
} from "./ContentCard.types";

interface CardRecord {
    id: number;
    // null for an anonymous viewer, so the heart only appears where the server knows who is looking
    isFavourite?: boolean | null;
    // absent where a list doesn't carry the rating totals
    ratingAverage?: number | null;
    ratingCount?: number;
}

export const cardRating = (record: CardRecord): ContentCardRating | null =>
    typeof record.ratingCount === "number"
        ? { average: record.ratingAverage ?? null, count: record.ratingCount }
        : null;

export const cardFavourite = (
    target: FavouriteTarget,
    record: CardRecord,
): ContentCardFavouriteState | null =>
    typeof record.isFavourite === "boolean"
        ? { target, id: record.id, isFavourite: record.isFavourite }
        : null;
