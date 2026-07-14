import i18next from "i18next";

import { ERROR_CODES } from "constants/errorCodes";

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const RATE_LIMIT_STATUS = 429;
// used only when the server did not send a Retry-After header
const DEFAULT_RATE_LIMIT_FALLBACK_SECONDS = 60;
const SERVER_ERROR_STATUS_THRESHOLD = 500;

// the axios base query maps every failure to { status, data: message }, so `data` is already user-facing
export const getQueryErrorMessage = (error: unknown): string => {
    if (isObject(error) && typeof error.data === "string") {
        return error.data;
    }

    return i18next.t("notifications.somethingWentWrong");
};

// the HTTP status the axios base query attached to a failed RTK Query result
export const getQueryErrorStatus = (error: unknown): number | null => {
    if (isObject(error) && typeof error.status === "number") {
        return error.status;
    }

    return null;
};

// the server Retry-After cool-down (seconds) the axios base query attached, if any
export const getQueryErrorRetryAfter = (error: unknown): number | null => {
    if (isObject(error) && typeof error.retryAfter === "number") {
        return error.retryAfter;
    }

    return null;
};

// the stable machine-readable error code the axios base query attached, if the server sent one
export const getQueryErrorCode = (error: unknown): string | null => {
    if (isObject(error) && typeof error.code === "string") {
        return error.code;
    }

    return null;
};

// true when the error is a rate-limit rejection (explicit code or raw 429 status)
export const isRateLimitError = (error: unknown): boolean =>
    getQueryErrorCode(error) === ERROR_CODES.RATE_LIMITED ||
    getQueryErrorStatus(error) === RATE_LIMIT_STATUS;

// the cool-down to show the user: the server's Retry-After header if present, else a fallback
export const getRateLimitSeconds = (error: unknown): number =>
    getQueryErrorRetryAfter(error) ?? DEFAULT_RATE_LIMIT_FALLBACK_SECONDS;

// true for a 5xx - the server's own fault, not a validation/auth rejection
export const isServerError = (error: unknown): boolean => {
    const status = getQueryErrorStatus(error);

    return status !== null && status >= SERVER_ERROR_STATUS_THRESHOLD;
};
