import type { InfiniteData } from "@reduxjs/toolkit/query";

import { PAGE_SIZE } from "constants/pagination";
import type { PaginatedResult } from "types/pagination";

import { sumBy } from "utils/sum";

export const getNextOffsetParam = (
    lastPage: PaginatedResult<unknown>,
    allPages: PaginatedResult<unknown>[],
): number | undefined => {
    const loaded = sumBy(allPages, (page) => page.items.length);

    return loaded < lastPage.total ? loaded : undefined;
};

export const offsetPagedQuery = <TArg extends object>(url: string) => ({
    infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: getNextOffsetParam,
    },
    query: ({
        queryArg,
        pageParam,
    }: {
        queryArg: TArg;
        pageParam: number;
    }) => ({
        url,
        params: { ...queryArg, limit: PAGE_SIZE, offset: pageParam },
    }),
});

export const flattenPages = <T>(
    data: InfiniteData<PaginatedResult<T>, number> | undefined,
): T[] => data?.pages.flatMap((page) => page.items) ?? [];

// the most recently fetched page carries the freshest total
export const getPaginatedTotal = (
    data: InfiniteData<PaginatedResult<unknown>, number> | undefined,
): number => {
    const pages = data?.pages ?? [];

    return pages[pages.length - 1]?.total ?? 0;
};
