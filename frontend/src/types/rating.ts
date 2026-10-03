// ratingAverage is unrounded, null when unrated; myRating is null for a guest or a non-voter
export interface RecordRating {
    ratingAverage: number | null;
    ratingCount: number;
    myRating: number | null;
}

export type RatingTarget = "recipe" | "menu";
