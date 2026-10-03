export type RatingTarget = "recipe" | "menu";

// lets the caller answer 404 or 400 instead of a foreign-key 500 or a self-vote
export type RateOutcome = "rated" | "not_found" | "own_record";

export interface RatingRepository {
    rate(
        personId: number,
        target: RatingTarget,
        targetId: number,
        value: number,
    ): Promise<RateOutcome>;
    remove(
        personId: number,
        target: RatingTarget,
        targetId: number,
    ): Promise<void>;
}
