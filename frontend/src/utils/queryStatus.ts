import { ignoreRejection } from "utils/ignoreRejection";
export interface QueryStatusSource {
    isLoading: boolean;
    isError: boolean;
    data?: unknown;
    refetch: () => Promise<unknown>;
}

export interface QueryStatus {
    isLoading: boolean;
    isError: boolean;
    retry: () => void;
}

// a failed refetch or next page keeps what is already on screen
export const hasFailedWithoutData = (
    query: Pick<QueryStatusSource, "isError" | "data">,
): boolean => query.isError && typeof query.data === "undefined";

export const combineQueryStatus = (
    queries: readonly QueryStatusSource[],
): QueryStatus => {
    const failed = queries.filter(hasFailedWithoutData);

    return {
        isLoading: queries.some((query) => query.isLoading),
        isError: failed.length > 0,
        retry: () => {
            Promise.all(failed.map((query) => query.refetch())).catch(
                ignoreRejection,
            );
        },
    };
};
