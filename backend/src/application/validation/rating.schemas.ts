import { z } from "zod";

import { RATING_LIMITS } from "constants/ratings";

import { integerSchema } from "./common.schemas";

const { MIN, MAX } = RATING_LIMITS;

export const rateSchema = z.object({
    value: integerSchema("Rating")
        .min(MIN, `Rating must be at least ${MIN}`)
        .max(MAX, `Rating must be at most ${MAX}`),
});
