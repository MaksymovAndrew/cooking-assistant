import type { MetadataRoute } from "next";

import { absoluteSiteUrl } from "config/site";
import { LOCALES } from "constants/locales";
import { menuDetailsPath, recipeDetailsPath, ROUTES } from "constants/routes";
import type { PaginatedResult } from "types/pagination";

import { API_ROUTES } from "api/endpoints";
import { fetchPublic } from "api/server";

import { localizePath } from "utils/localePath";

// the API caps a page at 100 rows
const PAGE_LIMIT = 100;
const REVALIDATE_SECONDS = 3600;

// per request: the Docker build cannot reach the API; the fetches still cache for an hour
export const dynamic = "force-dynamic";

const pageQuery = (offset: number): string =>
    `?limit=${String(PAGE_LIMIT)}&offset=${String(offset)}`;

interface Listed {
    id: number;
    creation_date: string;
}

interface Listing {
    path: string;
    lastModified: string | null;
}

const loadListings = async (
    endpoint: string,
    toPath: (id: number) => string,
): Promise<Listing[]> => {
    const listings: Listing[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
        const page = await fetchPublic<PaginatedResult<Listed>>(
            `${endpoint}${pageQuery(offset)}`,
            REVALIDATE_SECONDS,
        );
        const items = page?.items ?? [];

        listings.push(
            ...items.map((item) => ({
                path: toPath(item.id),
                lastModified: item.creation_date,
            })),
        );
        offset += PAGE_LIMIT;
        hasMore = items.length > 0 && offset < (page?.total ?? 0);
    }

    return listings;
};

// each language version names the others, so each is indexed in its own right
const languageVersions = ({
    path,
    lastModified,
}: Listing): MetadataRoute.Sitemap => {
    const languages = Object.fromEntries(
        LOCALES.map((locale) => [
            locale,
            absoluteSiteUrl(localizePath(path, locale)),
        ]),
    );

    return LOCALES.map((locale) => ({
        url: languages[locale],
        ...(lastModified === null ? {} : { lastModified }),
        alternates: { languages },
    }));
};

// built without a session: the private area has no public URL and never appears
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
    const [recipes, menus] = await Promise.all([
        loadListings(API_ROUTES.recipes.byFilters, recipeDetailsPath),
        loadListings(API_ROUTES.menu.list, menuDetailsPath),
    ]);
    // the browse pages change with every new record, so they carry no single date
    const browsePages = [ROUTES.home, ROUTES.allRecipes, ROUTES.allMenus].map(
        (path) => ({ path, lastModified: null }),
    );

    return [...browsePages, ...recipes, ...menus].flatMap(languageVersions);
};

export default sitemap;
