import { cache } from "react";

import { SOCIAL_IMAGE_REVALIDATE_SECONDS } from "constants/social";
import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";
import { fetchAsVisitor, fetchPublic } from "api/server";

// the metadata and the page both need the recipe; cache() makes that one request
export const loadRecipe = cache(
    async (id: string): Promise<RecipeDetails | null> =>
        fetchAsVisitor<RecipeDetails>(API_ROUTES.recipes.byId(id)),
);

// the preview image carries nothing per viewer: no session, so it can be built once and cached
export const loadPublicRecipe = async (
    id: string,
): Promise<RecipeDetails | null> =>
    fetchPublic<RecipeDetails>(
        API_ROUTES.recipes.byId(id),
        SOCIAL_IMAGE_REVALIDATE_SECONDS,
    );
