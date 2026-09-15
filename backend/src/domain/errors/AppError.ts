import type { ErrorCode } from "constants/errorCodes";

// carries a code, never display text: errorHandler resolves the copy from the i18n catalog at the HTTP edge, the one
// place a request's locale can be known. detail is optional request-specific context, such as a zod issue list
export class AppError extends Error {
    status: number;
    code: ErrorCode;
    detail: string | null;

    constructor(code: ErrorCode, status: number, detail: string | null = null) {
        super(detail ?? code);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
        this.detail = detail;
    }
}

export class ValidationError extends AppError {
    constructor(code: ErrorCode, detail: string | null = null) {
        super(code, 400, detail);
    }
}

export class UnauthorizedError extends AppError {
    constructor(code: ErrorCode, detail: string | null = null) {
        super(code, 401, detail);
    }
}

export class ForbiddenError extends AppError {
    constructor(code: ErrorCode, detail: string | null = null) {
        super(code, 403, detail);
    }
}

export class NotFoundError extends AppError {
    constructor(code: ErrorCode, detail: string | null = null) {
        super(code, 404, detail);
    }
}

export class ConflictError extends AppError {
    constructor(code: ErrorCode, detail: string | null = null) {
        super(code, 409, detail);
    }
}
