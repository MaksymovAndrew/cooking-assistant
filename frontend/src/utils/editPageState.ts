import { getQueryErrorStatus } from "utils/queryError";

export const EDIT_PAGE_STATE = {
    loading: "loading",
    notFound: "notFound",
    error: "error",
    ready: "ready",
} as const;

export type EditPageState =
    (typeof EDIT_PAGE_STATE)[keyof typeof EDIT_PAGE_STATE];

const BAD_REQUEST_STATUS = 400;
const NOT_FOUND_STATUS = 404;
// a malformed id answers 400 and a missing record 404 - either way there is nothing here to edit
const MISSING_RECORD_STATUSES = new Set([BAD_REQUEST_STATUS, NOT_FOUND_STATUS]);

interface RecordQueryStatus {
    isLoading: boolean;
    isError: boolean;
    error?: unknown;
}

export const resolveEditPageState = (
    query: RecordQueryStatus,
    isOwner: boolean | null,
): EditPageState => {
    if (query.isError) {
        const status = getQueryErrorStatus(query.error);

        return status !== null && MISSING_RECORD_STATUSES.has(status)
            ? EDIT_PAGE_STATE.notFound
            : EDIT_PAGE_STATE.error;
    }

    if (query.isLoading || isOwner === null) {
        return EDIT_PAGE_STATE.loading;
    }

    return isOwner ? EDIT_PAGE_STATE.ready : EDIT_PAGE_STATE.notFound;
};
