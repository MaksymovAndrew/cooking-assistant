import type { MetadataRoute } from "next";

import { absoluteSiteUrl } from "config/site";
import { menuDetailsPath, recipeDetailsPath, ROUTES } from "constants/routes";
import type { PaginatedResult } from "types/pagination";

import { API_ROUTES } from "api/endpoints";
import { fetchPublic } from "api/server";

// the API caps a page at 100 rows, so the whole public catalogue is a handful of requests -
// rebuilt hourly rather than on every crawler visit
const PAGE_LIMIT = 100;
const REVALIDATE_SECONDS = 3600;

// built on request, not at build time: the catalogue is live data, and the image is built
// where the API is not reachable at all. The fetches below still hold their answers for an
// hour, so repeated crawls cost nothing
export const dynamic = "force-dynamic";

const pageQuery = (offset: number): string =>
    `?limit=${String(PAGE_LIMIT)}&offset=${String(offset)}`;

// both public lists expose an id and nothing else is needed to build a link
interface Listed {
    id: number;
}

const loadPaths = async (
    endpoint: string,
    toPath: (item: Listed) => string,
): Promise<string[]> => {
    const paths: string[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const page = await fetchPublic<PaginatedResult<Listed>>(
            `${endpoint}${pageQuery(offset)}`,
            REVALIDATE_SECONDS,
        );
        const items = page?.items ?? [];

        paths.push(...items.map(toPath));
        offset += PAGE_LIMIT;
        hasMore = items.length > 0 && offset < (page?.total ?? 0);
    }

    return paths;
};

// listed without a session, so nothing here can be personalised: the private area has no
// public URL to offer and never appears
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
    const [recipes, menus] = await Promise.all([
        loadPaths(API_ROUTES.recipes.byFilters, (recipe) =>
            recipeDetailsPath(recipe.id),
        ),
        loadPaths(API_ROUTES.menu.list, (menu) => menuDetailsPath(menu.id)),
    ]);

    return [
        ROUTES.home,
        ROUTES.allRecipes,
        ROUTES.allMenus,
        ...recipes,
        ...menus,
    ].map((path) => ({ url: absoluteSiteUrl(path) }));
};

export default sitemap;
