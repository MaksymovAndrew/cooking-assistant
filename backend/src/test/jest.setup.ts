import type { ErrorCode } from "constants/errorCodes";

process.env.JWT_SECRET_KEY ??= "test-secret-test-secret-test-secret";

type ErrorClass = abstract new (...args: never[]) => Error;

expect.extend({
    toBeAppError(
        received: unknown,
        ErrorClass: ErrorClass,
        code: ErrorCode,
        status: number,
        detail: string | null = null,
    ) {
        const pass =
            received instanceof ErrorClass &&
            "code" in received &&
            received.code === code &&
            "status" in received &&
            received.status === status &&
            "detail" in received &&
            received.detail === detail;

        return {
            pass,
            message: () =>
                `expected error to be ${ErrorClass.name} with code "${code}", status ${status} and detail ${JSON.stringify(detail)}`,
        };
    },
});

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeAppError(
                ErrorClass: ErrorClass,
                code: ErrorCode,
                status: number,
                detail?: string | null,
            ): R;
        }
    }
}
