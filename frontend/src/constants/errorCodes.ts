// mirrors backend/src/constants/errorMessages.ts's ERROR_CODES - the auth error codes the frontend needs to switch on
export const ERROR_CODES = {
    LOGIN_ALREADY_TAKEN: "auth/login_already_taken",
    EMAIL_ALREADY_TAKEN: "auth/email_already_taken",
    INVALID_LOGIN_OR_PASSWORD: "auth/invalid_login_or_password",
    CURRENT_PASSWORD_INCORRECT: "auth/current_password_incorrect",
    INVALID_OR_EXPIRED_TOKEN: "auth/invalid_or_expired_token",
    EMAIL_ALREADY_VERIFIED: "auth/email_already_verified",
    NEW_PASSWORD_SAME_AS_CURRENT: "auth/new_password_same_as_current",
    VALIDATION_ERROR: "validation_error",
    RATE_LIMITED: "rate_limited",
} as const;
