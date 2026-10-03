import { unstable_rethrow } from "next/navigation";

import { logger } from "config/logger";
import {
    GUEST_LANDING_MENU_COUNT,
    GUEST_LANDING_RECIPE_COUNT,
} from "constants/guestLanding";
import type { Locale } from "constants/locales";
import type { GuestLandingContent } from "types/guestLanding";
import type { Menu } from "types/menu";
import type { PaginatedResult } from "types/pagination";
import type { RecipeSearchResultItem } from "types/recipe";

import { API_ROUTES } from "api/endpoints";
import { fetchAsVisitor } from "api/server";

export const CLIENT_LOADED_LANDING: GuestLandingContent = {
    recipes: null,
    menus: null,
};

const loadList = async <T>(
    endpoint: string,
    limit: number,
    locale: Locale,
): Promise<T[] | null> => {
    try {
        const page = await fetchAsVisitor<PaginatedResult<T>>(
            `${endpoint}?limit=${String(limit)}`,
            locale,
        );

        return page?.items ?? null;
    } catch (error) {
        // the dynamic-rendering signal must reach Next, the same as on the session check
        unstable_rethrow(error);
        logger.error(error);

        return null;
    }
};

// in the first response, so a crawler reads real recipes and a visitor sees no empty frame
export const loadGuestLanding = async (
    locale: Locale,
): Promise<GuestLandingContent> => {
    const [recipes, menus] = await Promise.all([
        loadList<RecipeSearchResultItem>(
            API_ROUTES.recipes.byFilters,
            GUEST_LANDING_RECIPE_COUNT,
            locale,
        ),
        loadList<Menu>(API_ROUTES.menu.list, GUEST_LANDING_MENU_COUNT, locale),
    ]);

    return { recipes, menus };
};
