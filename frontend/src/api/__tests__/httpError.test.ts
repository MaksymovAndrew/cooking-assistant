import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosError, AxiosHeaders } from "axios";

import {
    getApiErrorCode,
    getApiErrorMessage,
    getApiErrorRetryAfter,
    getApiErrorStatus,
} from "api/httpError";

const SERVER_MESSAGE = "Too many requests";
const AXIOS_MESSAGE = "Request failed with status code 429";
const AXIOS_CODE = "ERR_BAD_REQUEST";
const STATUS_TEXT = "Too Many Requests";
const UNKNOWN = "Unknown error";

const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };

describe("getApiErrorMessage", () => {
    it("should return the server error message from an axios error response", () => {
        const response: AxiosResponse = {
            data: { error: SERVER_MESSAGE },
            status: 429,
            statusText: STATUS_TEXT,
            headers: new AxiosHeaders(),
            config,
        };
        const error = new AxiosError(
            AXIOS_MESSAGE,
            AXIOS_CODE,
            config,
            undefined,
            response,
        );

        expect(getApiErrorMessage(error)).toBe(SERVER_MESSAGE);
    });

    it("should fall back to the axios error message when the response has no error field", () => {
        const error = new AxiosError(AXIOS_MESSAGE);

        expect(getApiErrorMessage(error)).toBe(AXIOS_MESSAGE);
    });

    it("should return the error message for a plain Error instance", () => {
        expect(getApiErrorMessage(new Error("boom"))).toBe("boom");
    });

    it("should return a default message for a non-Error non-axios throw", () => {
        expect(getApiErrorMessage("raw string")).toBe(UNKNOWN);
    });
});

describe("getApiErrorStatus", () => {
    it("should return the status from an axios error response", () => {
        const response: AxiosResponse = {
            data: {},
            status: 429,
            statusText: STATUS_TEXT,
            headers: new AxiosHeaders(),
            config,
        };
        const error = new AxiosError(
            AXIOS_MESSAGE,
            AXIOS_CODE,
            config,
            undefined,
            response,
        );

        expect(getApiErrorStatus(error)).toBe(429);
    });

    it("should return undefined for an axios error without a response", () => {
        expect(
            getApiErrorStatus(new AxiosError(AXIOS_MESSAGE)),
        ).toBeUndefined();
    });

    it("should return undefined for a non-axios error", () => {
        expect(getApiErrorStatus(new Error("boom"))).toBeUndefined();
    });
});

describe("getApiErrorRetryAfter", () => {
    it("should return the Retry-After seconds from an axios error response", () => {
        const response: AxiosResponse = {
            data: {},
            status: 429,
            statusText: STATUS_TEXT,
            headers: new AxiosHeaders({ "retry-after": "45" }),
            config,
        };
        const error = new AxiosError(
            AXIOS_MESSAGE,
            AXIOS_CODE,
            config,
            undefined,
            response,
        );

        expect(getApiErrorRetryAfter(error)).toBe(45);
    });

    it("should return null for an axios error without a Retry-After header", () => {
        expect(getApiErrorRetryAfter(new AxiosError(AXIOS_MESSAGE))).toBeNull();
    });

    it("should return null for a non-axios error", () => {
        expect(getApiErrorRetryAfter(new Error("boom"))).toBeNull();
    });
});

describe("getApiErrorCode", () => {
    it("should return the code from an axios error response", () => {
        const response: AxiosResponse = {
            data: { error: SERVER_MESSAGE, code: "RATE_LIMITED" },
            status: 429,
            statusText: STATUS_TEXT,
            headers: new AxiosHeaders(),
            config,
        };
        const error = new AxiosError(
            AXIOS_MESSAGE,
            AXIOS_CODE,
            config,
            undefined,
            response,
        );

        expect(getApiErrorCode(error)).toBe("RATE_LIMITED");
    });

    it("should return null when the response has no code field", () => {
        const response: AxiosResponse = {
            data: { error: SERVER_MESSAGE },
            status: 429,
            statusText: STATUS_TEXT,
            headers: new AxiosHeaders(),
            config,
        };
        const error = new AxiosError(
            AXIOS_MESSAGE,
            AXIOS_CODE,
            config,
            undefined,
            response,
        );

        expect(getApiErrorCode(error)).toBeNull();
    });

    it("should return null for a non-axios error", () => {
        expect(getApiErrorCode(new Error("boom"))).toBeNull();
    });
});
