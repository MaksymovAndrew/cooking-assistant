import { ERROR_CODES, ERROR_MESSAGES } from "constants/errorMessages";
import { AppError } from "domain/errors/AppError";

const UNIQUE_LOGIN_CONSTRAINT = "unique_login";
const UNIQUE_EMAIL_CONSTRAINT = "unique_email";

// null when the error isn't a unique-violation at all; otherwise the constraint name Postgres reported
function getUniqueViolationConstraint(error: unknown): string | null {
    const isUniqueViolation =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: unknown }).code === "23505";

    if (!isUniqueViolation) {
        return null;
    }

    const { constraint } = error as { constraint?: unknown };

    return typeof constraint === "string" ? constraint : null;
}

// maps a unique-violation to the right domain error; null when the error isn't one we recognize (caller rethrows as-is)
export function uniqueViolationError(error: unknown): AppError | null {
    const constraint = getUniqueViolationConstraint(error);

    if (constraint === UNIQUE_EMAIL_CONSTRAINT) {
        return new AppError(
            ERROR_MESSAGES.EMAIL_ALREADY_TAKEN,
            409,
            ERROR_CODES.EMAIL_ALREADY_TAKEN,
        );
    }

    if (constraint === UNIQUE_LOGIN_CONSTRAINT) {
        return new AppError(
            ERROR_MESSAGES.LOGIN_ALREADY_TAKEN,
            409,
            ERROR_CODES.LOGIN_ALREADY_TAKEN,
        );
    }

    return null;
}
