import i18next from "i18next";

import { ERROR_CODES } from "constants/errorCodes";

import {
    getQueryErrorMessage,
    getRateLimitSeconds,
    isRateLimitError,
    isServerError,
} from "utils/queryError";

describe("getQueryErrorMessage", () => {
    it("should return the data string from an axios base query error", () => {
        expect(
            getQueryErrorMessage(i18next.t, { status: 500, data: "Boom" }),
        ).toBe("Boom");
    });

    it("should fall back when the error has no string data", () => {
        expect(getQueryErrorMessage(i18next.t, { status: 500 })).toBe(
            "Something went wrong",
        );
    });

    it("should fall back for an unknown error shape", () => {
        expect(getQueryErrorMessage(i18next.t, undefined)).toBe(
            "Something went wrong",
        );
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
