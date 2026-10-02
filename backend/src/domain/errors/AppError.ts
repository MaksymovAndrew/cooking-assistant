import type { ErrorCode } from "constants/errorCodes";
import type { ValidationMessage } from "constants/validationMessages";

// carries a code, never display text: errorHandler resolves the copy from the i18n catalog at the HTTP edge, the one
// place a request's locale can be known
export class AppError extends Error {
    status: number;
    code: ErrorCode;

    constructor(code: ErrorCode, status: number) {
        super(code);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
    }
}

// one rejected request field: path is the field's own name, so the localized message never repeats it
export interface ValidationIssue {
    path: string;
    message: ValidationMessage;
    params: Record<string, string | number>;
}

export class ValidationError extends AppError {
    issues: readonly ValidationIssue[];

    constructor(code: ErrorCode, issues: readonly ValidationIssue[] = []) {
        super(code, 400);
        this.issues = issues;
    }
}

export class UnauthorizedError extends AppError {
    constructor(code: ErrorCode) {
        super(code, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(code: ErrorCode) {
        super(code, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(code: ErrorCode) {
        super(code, 404);
    }
}

export class ConflictError extends AppError {
    constructor(code: ErrorCode) {
        super(code, 409);
    }
}
