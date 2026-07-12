import type { InfiniteData } from "@reduxjs/toolkit/query";

import type { PaginatedResult } from "types/pagination";

// the next OFFSET to request, or undefined once every item has been loaded - shared getNextPageParam for every offset-paginated infiniteQuery endpoint
export const getNextOffsetParam = (
    lastPage: PaginatedResult<unknown>,
    allPages: PaginatedResult<unknown>[],
): number | undefined => {
    const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);

    return loaded < lastPage.total ? loaded : undefined;
};

export const flattenPages = <T>(
    data: InfiniteData<PaginatedResult<T>, number> | undefined,
): T[] => data?.pages.flatMap((page) => page.items) ?? [];

// the total row count reported by the most recently fetched page - self-corrects after a mutation invalidates and refetches the cached pages
export const getPaginatedTotal = (
    data: InfiniteData<PaginatedResult<unknown>, number> | undefined,
): number => {
    const pages = data?.pages ?? [];

    return pages[pages.length - 1]?.total ?? 0;
};
