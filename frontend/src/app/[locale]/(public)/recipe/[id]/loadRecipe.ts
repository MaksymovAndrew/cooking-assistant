import { cache } from "react";

import type { Locale } from "constants/locales";
import { SOCIAL_IMAGE_REVALIDATE_SECONDS } from "constants/social";
import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";
import { fetchAsVisitor, fetchPublic } from "api/server";

import { isRecordId } from "utils/recordIdParam";

// the metadata and the page both need the recipe; cache() makes that one request
export const loadRecipe = cache(
    async (id: string, locale: Locale): Promise<RecipeDetails | null> =>
        isRecordId(id)
            ? fetchAsVisitor<RecipeDetails>(API_ROUTES.recipes.byId(id), locale)
            : null,
);

// the preview image carries nothing per viewer: no session, so it can be built once and cached
export const loadPublicRecipe = async (
    id: string,
): Promise<RecipeDetails | null> =>
    isRecordId(id)
        ? fetchPublic<RecipeDetails>(
              API_ROUTES.recipes.byId(id),
              SOCIAL_IMAGE_REVALIDATE_SECONDS,
          )
        : null;
