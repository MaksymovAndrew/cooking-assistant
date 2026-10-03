import type { ErrorCode } from "constants/errorCodes";
import type { ValidationMessage } from "constants/validationMessages";

// a code, never display text: only the HTTP edge knows the request's locale
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
