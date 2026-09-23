export const RATING_LIMITS = {
    MIN: 1,
    MAX: 5,
    // the "rated 4+" filter compares the same plain average a card shows
    TOP_RATED_AVERAGE: 4,
} as const;

// the rating sort pulls every record toward this prior as if it already had PRIOR_VOTES votes of
// PRIOR_MEAN, so a single five-star vote can't outrank fifty votes averaging 4.8
export const RATING_SORT_PRIOR = {
    PRIOR_VOTES: 5,
    PRIOR_MEAN: 3,
} as const;
