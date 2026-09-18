import { z } from "zod";

import { ALLERGEN_SLUGS } from "constants/allergens";

export const allergenSlugSchema = z.enum(ALLERGEN_SLUGS, {
    error: "Unknown allergen",
});
