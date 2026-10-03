import { ERROR_CODES } from "constants/errorCodes";
import { type AppError, ConflictError } from "domain/errors/AppError";
import { errorField } from "domain/errors/errorField";

const UNIQUE_LOGIN_CONSTRAINT = "unique_login";
const UNIQUE_EMAIL_CONSTRAINT = "unique_email";

function getUniqueViolationConstraint(error: unknown): string | null {
    if (errorField(error, "code") !== "23505") {
        return null;
    }

    const constraint = errorField(error, "constraint");

    return typeof constraint === "string" ? constraint : null;
}

export function uniqueViolationError(error: unknown): AppError | null {
    const constraint = getUniqueViolationConstraint(error);

    if (constraint === UNIQUE_EMAIL_CONSTRAINT) {
        return new ConflictError(ERROR_CODES.EMAIL_ALREADY_TAKEN);
    }

    if (constraint === UNIQUE_LOGIN_CONSTRAINT) {
        return new ConflictError(ERROR_CODES.LOGIN_ALREADY_TAKEN);
    }

    return null;
}
