export class AppError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
        this.code = code;
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, code?: string) {
        super(message, 404, code);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, code?: string) {
        super(message, 400, code);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string, code?: string) {
        super(message, 401, code);
    }
}
