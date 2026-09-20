import {
    type LockoutState,
    mergeServerRetryAfter,
    registerFailure,
} from "utils/loginLockout";
import {
    getRateLimitSeconds,
    isRateLimitError,
    isServerError,
} from "utils/queryError";

export interface LoginFailure {
    // null leaves the lockout ladder untouched - a server fault is not the account's fault
    next: LockoutState | null;
    errorKey: string;
    seconds?: number;
}

export function resolveLoginFailure(
    error: unknown,
    lockout: LockoutState,
): LoginFailure {
    if (isRateLimitError(error)) {
        const seconds = getRateLimitSeconds(error);

        // counts as a failed attempt too, so the client ladder stays in sync with an early server rejection
        return {
            next: mergeServerRetryAfter(registerFailure(lockout), seconds),
            errorKey: "errors.tooManyAttempts",
            seconds,
        };
    }

    if (isServerError(error)) {
        return { next: null, errorKey: "errors.serverError" };
    }

    return {
        next: registerFailure(lockout),
        errorKey: "errors.invalidCredentials",
    };
}
