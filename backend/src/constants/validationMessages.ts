// keys of a request-validation message; the text lives in i18n/locales/<locale>/validation.json, and the
// issue's path names the field, so a message never repeats it
export const VALIDATION_MESSAGES = {
    REQUIRED: "required",
    EXPECTED_STRING: "expectedString",
    EXPECTED_NUMBER: "expectedNumber",
    EXPECTED_INTEGER: "expectedInteger",
    EXPECTED_BOOLEAN: "expectedBoolean",
    EXPECTED_ARRAY: "expectedArray",
    EXPECTED_OBJECT: "expectedObject",
    INVALID_TYPE: "invalidType",
    AT_LEAST: "atLeast",
    GREATER_THAN: "greaterThan",
    AT_MOST: "atMost",
    LESS_THAN: "lessThan",
    MIN_LENGTH: "minLength",
    MAX_LENGTH: "maxLength",
    MIN_ITEMS: "minItems",
    MAX_ITEMS: "maxItems",
    INVALID_EMAIL: "invalidEmail",
    INVALID_DATE: "invalidDate",
    INVALID_DATETIME: "invalidDatetime",
    INVALID_FORMAT: "invalidFormat",
    ONE_OF: "oneOf",
    INVALID: "invalid",
    NOT_EMPTY: "notEmpty",
    UNIQUE: "unique",
    ID_LIST: "idList",
    BOOLEAN_TEXT: "booleanText",
    PASSWORD_RULES: "passwordRules",
    PASSWORD_TOO_LONG: "passwordTooLong",
    LOGIN_WITHOUT_AT: "loginWithoutAt",
    EXACTLY_ONE_SOURCE: "exactlyOneSource",
    AT_LEAST_ONE_FIELD: "atLeastOneField",
} as const;

export type ValidationMessage =
    (typeof VALIDATION_MESSAGES)[keyof typeof VALIDATION_MESSAGES];

const MESSAGE_SET = new Set<string>(Object.values(VALIDATION_MESSAGES));

export function isValidationMessage(value: string): value is ValidationMessage {
    return MESSAGE_SET.has(value);
}
