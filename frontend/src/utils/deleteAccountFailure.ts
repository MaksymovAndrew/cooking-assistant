import { ERROR_CODES } from "constants/errorCodes";

import {
    type LockoutState,
    mergeServerRetryAfter,
    registerFailure,
} from "utils/loginLockout";
import {
    getQueryErrorCode,
    getRateLimitSeconds,
    isRateLimitError,
} from "utils/queryError";

export interface DeleteAccountFailure {
    // null leaves the lockout ladder untouched - only a wrong password or a 429 counts as an attempt
    next: LockoutState | null;
    errorKey: string;
    seconds?: number;
}

// t keys are under "settings:deleteAccountModal.errors"
export function resolveDeleteAccountFailure(
    error: unknown,
    lockout: LockoutState,
): DeleteAccountFailure {
    if (isRateLimitError(error)) {
        const seconds = getRateLimitSeconds(error);

        return {
            next: mergeServerRetryAfter(registerFailure(lockout), seconds),
            errorKey: "deleteAccountModal.errors.tooManyAttempts",
            seconds,
        };
    }

    if (getQueryErrorCode(error) === ERROR_CODES.CURRENT_PASSWORD_INCORRECT) {
        return {
            next: registerFailure(lockout),
            errorKey: "deleteAccountModal.errors.incorrectPassword",
        };
    }

    return { next: null, errorKey: "deleteAccountModal.errors.genericError" };
}
