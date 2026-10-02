import { z } from "zod";

import { RATING_LIMITS } from "constants/ratings";

import { integerSchema } from "./common.schemas";

export const rateSchema = z.object({
    value: integerSchema().min(RATING_LIMITS.MIN).max(RATING_LIMITS.MAX),
});
