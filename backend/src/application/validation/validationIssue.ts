import type { core } from "zod";

import {
    isValidationMessage,
    VALIDATION_MESSAGES as M,
    type ValidationMessage,
} from "constants/validationMessages";
import type { ValidationIssue } from "domain/errors/AppError";

type Params = ValidationIssue["params"];

const EXPECTED_MESSAGES: Record<string, ValidationMessage> = {
    string: M.EXPECTED_STRING,
    number: M.EXPECTED_NUMBER,
    int: M.EXPECTED_INTEGER,
    boolean: M.EXPECTED_BOOLEAN,
    array: M.EXPECTED_ARRAY,
    object: M.EXPECTED_OBJECT,
};

const FORMAT_MESSAGES: Record<string, ValidationMessage> = {
    email: M.INVALID_EMAIL,
    date: M.INVALID_DATE,
    datetime: M.INVALID_DATETIME,
};

const NUMBER_ORIGINS = new Set(["number", "int", "bigint"]);
const ITEM_ORIGINS = new Set(["array", "set"]);

function boundMessage(
    origin: string,
    inclusive: boolean | undefined,
    lower: boolean,
): ValidationMessage {
    if (NUMBER_ORIGINS.has(origin)) {
        if (lower) {
            return inclusive ? M.AT_LEAST : M.GREATER_THAN;
        }

        return inclusive ? M.AT_MOST : M.LESS_THAN;
    }

    if (ITEM_ORIGINS.has(origin)) {
        return lower ? M.MIN_ITEMS : M.MAX_ITEMS;
    }

    return lower ? M.MIN_LENGTH : M.MAX_LENGTH;
}

function customParams(params: Record<string, unknown> | undefined): Params {
    const result: Params = {};

    for (const [name, value] of Object.entries(params ?? {})) {
        if (typeof value === "string" || typeof value === "number") {
            result[name] = value;
        }
    }

    return result;
}

type Described = [ValidationMessage, Params];

function describeLowerBound(issue: core.$ZodIssueTooSmall): Described {
    // "at least 1 item" is how a list says it may not be empty
    if (ITEM_ORIGINS.has(issue.origin) && Number(issue.minimum) === 1) {
        return [M.NOT_EMPTY, {}];
    }

    return [
        boundMessage(issue.origin, issue.inclusive, true),
        { min: Number(issue.minimum) },
    ];
}

function describeByCode(issue: core.$ZodIssue): Described {
    switch (issue.code) {
        case "invalid_type":
            return [EXPECTED_MESSAGES[issue.expected] ?? M.INVALID_TYPE, {}];
        case "too_small":
            return describeLowerBound(issue);
        case "too_big":
            return [
                boundMessage(issue.origin, issue.inclusive, false),
                { max: Number(issue.maximum) },
            ];
        case "invalid_format":
            return [FORMAT_MESSAGES[issue.format] ?? M.INVALID_FORMAT, {}];
        case "invalid_value":
            return [M.ONE_OF, { values: issue.values.map(String).join(", ") }];
        case "custom":
        case "not_multiple_of":
        case "unrecognized_keys":
        case "invalid_union":
        case "invalid_key":
        case "invalid_element":
            break;
    }

    return [M.INVALID, {}];
}

function describe(issue: core.$ZodIssue): Described {
    // a schema's own key wins over what the issue code alone would say
    if (isValidationMessage(issue.message)) {
        const params = issue.code === "custom" ? issue.params : undefined;

        return [issue.message, customParams(params)];
    }

    // reportInput leaves input undefined exactly for a field that was not sent
    if (typeof issue.input === "undefined") {
        return [M.REQUIRED, {}];
    }

    return describeByCode(issue);
}

export function toValidationIssue(issue: core.$ZodIssue): ValidationIssue {
    const [message, params] = describe(issue);

    return { path: issue.path.map(String).join("."), message, params };
}
