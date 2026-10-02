import type { ErrorCode } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";
import { translateValidationIssues } from "i18n/translate";

process.env.JWT_SECRET_KEY ??= "test-secret-test-secret-test-secret";

type ErrorClass = abstract new (...args: never[]) => Error;

// the English text a validation error renders to, or null for any other error
function renderedDetail(received: unknown): string | null {
    return received instanceof ValidationError && received.issues.length > 0
        ? translateValidationIssues(received.issues, "en")
        : null;
}

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
            renderedDetail(received) === detail;

        return {
            pass,
            message: () =>
                `expected error to be ${ErrorClass.name} with code "${code}", status ${status} and detail ${JSON.stringify(detail)}, got detail ${JSON.stringify(renderedDetail(received))}`,
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
