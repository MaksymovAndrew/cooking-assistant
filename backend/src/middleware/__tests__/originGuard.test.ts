import type { Request, Response } from "express";

import { ERROR_CODES } from "constants/errorCodes";
import { ForbiddenError } from "domain/errors/AppError";

import { createOriginGuard } from "middleware/originGuard";

import { TEST_FRONTEND_ORIGIN } from "test/helpers/testConstants";

const FOREIGN_ORIGIN = "https://evil.example";

function makeRequest(method: string, origin?: string): Request {
    return { method, get: () => origin } as unknown as Request;
}

function makeNext() {
    return jest.fn((_error?: unknown) => null);
}

function passedError(next: ReturnType<typeof makeNext>): unknown {
    return next.mock.calls[0]?.[0];
}

describe("originGuard", () => {
    const res = {} as Response;
    const guard = createOriginGuard(TEST_FRONTEND_ORIGIN);

    it.each([
        ["another site", FOREIGN_ORIGIN],
        ["an opaque origin", "null"],
    ])(
        "should reject a write from %s with a 403 cross_origin_request",
        (_case, origin) => {
            const next = makeNext();

            guard(makeRequest("POST", origin), res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(passedError(next)).toBeAppError(
                ForbiddenError,
                ERROR_CODES.CROSS_ORIGIN_REQUEST,
                403,
            );
        },
    );

    it.each(["POST", "PUT", "PATCH", "DELETE"])(
        "should let a %s from the frontend's own origin through",
        (method) => {
            const next = makeNext();

            guard(makeRequest(method, TEST_FRONTEND_ORIGIN), res, next);

            expect(next).toHaveBeenCalledWith();
        },
    );

    it("should let a write without an Origin header through", () => {
        const next = makeNext();

        guard(makeRequest("POST"), res, next);

        expect(next).toHaveBeenCalledWith();
    });

    it("should let a read from another site through", () => {
        const next = makeNext();

        guard(makeRequest("GET", FOREIGN_ORIGIN), res, next);

        expect(next).toHaveBeenCalledWith();
    });
});
