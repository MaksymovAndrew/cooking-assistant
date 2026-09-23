// the aggregate every viewer sees plus the requester's own vote; ratingAverage is unrounded and null
// for a record nobody has rated yet, myRating is null for a guest and for a viewer who hasn't voted
export interface RecordRating {
    ratingAverage: number | null;
    ratingCount: number;
    myRating: number | null;
}

export type RatingTarget = "recipe" | "menu";
