import type { z } from "zod";

import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";

import { toValidationIssue } from "./validationIssue";

export function validate<Output, Input>(
    schema: z.ZodType<Output, Input>,
    data: unknown,
): Output {
    // reportInput tells a missing field (required) apart from one of the wrong type
    const result = schema.safeParse(data, { reportInput: true });

    if (!result.success) {
        throw new ValidationError(
            ERROR_CODES.VALIDATION_ERROR,
            result.error.issues.map(toValidationIssue),
        );
    }

    return result.data;
}
