import type { InfiniteData } from "@reduxjs/toolkit/query";

import type { PaginatedResult } from "types/pagination";

import { flattenPages } from "./infiniteQueryHelpers";

interface WithId {
    id: number;
}

export const LIST_ID = "LIST" as const;

export const listTag = <TagType extends string>(type: TagType) => ({
    type,
    id: LIST_ID,
});

// one tag per row plus LIST: an edit invalidates its own id, a create the LIST
export const listProvidesTags = <TagType extends string>(
    type: TagType,
    result: WithId[] | undefined,
) =>
    result
        ? [...result.map(({ id }) => ({ type, id })), listTag(type)]
        : [listTag(type)];

export const infiniteListProvidesTags = <TagType extends string>(
    type: TagType,
    result: InfiniteData<PaginatedResult<WithId>, number> | undefined,
) => listProvidesTags(type, flattenPages(result));
