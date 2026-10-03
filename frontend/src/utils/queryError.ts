import type { TFunction } from "i18next";

import { ERROR_CODES } from "constants/errorCodes";

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const RATE_LIMIT_STATUS = 429;
const DEFAULT_RATE_LIMIT_FALLBACK_SECONDS = 60;
const SERVER_ERROR_STATUS_THRESHOLD = 500;

// the axios base query already puts a user-facing message in data
export const getQueryErrorMessage = (t: TFunction, error: unknown): string => {
    if (isObject(error) && typeof error.data === "string") {
        return error.data;
    }

    return t("common:notifications.somethingWentWrong");
};

export const getQueryErrorStatus = (error: unknown): number | null => {
    if (isObject(error) && typeof error.status === "number") {
        return error.status;
    }

    return null;
};

export const getQueryErrorRetryAfter = (error: unknown): number | null => {
    if (isObject(error) && typeof error.retryAfter === "number") {
        return error.retryAfter;
    }

    return null;
};

export const getQueryErrorCode = (error: unknown): string | null => {
    if (isObject(error) && typeof error.code === "string") {
        return error.code;
    }

    return null;
};

export const isRateLimitError = (error: unknown): boolean =>
    getQueryErrorCode(error) === ERROR_CODES.RATE_LIMITED ||
    getQueryErrorStatus(error) === RATE_LIMIT_STATUS;

export const getRateLimitSeconds = (error: unknown): number =>
    getQueryErrorRetryAfter(error) ?? DEFAULT_RATE_LIMIT_FALLBACK_SECONDS;

export const isServerError = (error: unknown): boolean => {
    const status = getQueryErrorStatus(error);

    return status !== null && status >= SERVER_ERROR_STATUS_THRESHOLD;
};
