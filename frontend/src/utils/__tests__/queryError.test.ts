import i18next from "i18next";

import { ERROR_CODES } from "constants/errorCodes";

import {
    getQueryErrorCode,
    getQueryErrorMessage,
    getQueryErrorRetryAfter,
    getQueryErrorStatus,
    getRateLimitSeconds,
    isRateLimitError,
    isServerError,
} from "utils/queryError";

describe("getQueryErrorMessage", () => {
    it("should return the data string from an axios base query error", () => {
        expect(getQueryErrorMessage({ status: 500, data: "Boom" })).toBe(
            "Boom",
        );
    });

    it("should fall back when the error has no string data", () => {
        expect(getQueryErrorMessage({ status: 500 })).toBe(
            i18next.t("notifications.somethingWentWrong"),
        );
    });

    it("should fall back for an unknown error shape", () => {
        expect(getQueryErrorMessage(undefined)).toBe(
            i18next.t("notifications.somethingWentWrong"),
        );
    });
});

describe("getQueryErrorStatus", () => {
    it("should return the numeric status from a query error", () => {
        expect(getQueryErrorStatus({ status: 401, data: "x" })).toBe(401);
    });

    it("should return null when there is no numeric status", () => {
        expect(getQueryErrorStatus({ data: "x" })).toBeNull();
        expect(getQueryErrorStatus(undefined)).toBeNull();
    });
});

describe("getQueryErrorRetryAfter", () => {
    it("should return the numeric retryAfter from a query error", () => {
        expect(getQueryErrorRetryAfter({ retryAfter: 30 })).toBe(30);
    });

    it("should return null when retryAfter is not a number", () => {
        expect(getQueryErrorRetryAfter({ retryAfter: null })).toBeNull();
        expect(getQueryErrorRetryAfter(undefined)).toBeNull();
    });
});

describe("getQueryErrorCode", () => {
    it("should return the string code from a query error", () => {
        expect(getQueryErrorCode({ code: "LOGIN_ALREADY_TAKEN" })).toBe(
            "LOGIN_ALREADY_TAKEN",
        );
    });

    it("should return null when code is not a string", () => {
        expect(getQueryErrorCode({ code: null })).toBeNull();
        expect(getQueryErrorCode(undefined)).toBeNull();
    });
});

describe("isRateLimitError", () => {
    it("should be true for the rate-limited error code", () => {
        expect(isRateLimitError({ code: ERROR_CODES.RATE_LIMITED })).toBe(true);
    });

    it("should be true for a raw 429 status", () => {
        expect(isRateLimitError({ status: 429 })).toBe(true);
    });

    it("should be false for an unrelated error", () => {
        expect(isRateLimitError({ status: 401 })).toBe(false);
        expect(isRateLimitError(undefined)).toBe(false);
    });
});

describe("getRateLimitSeconds", () => {
    it("should return the server's retryAfter when present", () => {
        expect(getRateLimitSeconds({ retryAfter: 30 })).toBe(30);
    });

    it("should fall back to 60 seconds when the server sent none", () => {
        expect(getRateLimitSeconds({ status: 429 })).toBe(60);
        expect(getRateLimitSeconds(undefined)).toBe(60);
    });
});

describe("isServerError", () => {
    it("should be true for a 5xx status", () => {
        expect(isServerError({ status: 500 })).toBe(true);
        expect(isServerError({ status: 503 })).toBe(true);
    });

    it("should be false for a 4xx status or no status", () => {
        expect(isServerError({ status: 404 })).toBe(false);
        expect(isServerError(undefined)).toBe(false);
    });
});
