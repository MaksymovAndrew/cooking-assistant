import type { TFunction } from "i18next";

import { ERROR_CODES } from "constants/errorCodes";
import type { RegisterErrors, RegisterRequest } from "types/auth";

import {
    isValidEmail,
    isValidLogin,
    isValidNamePart,
    isValidPassword,
} from "utils/authValidation";
import {
    getQueryErrorCode,
    getQueryErrorStatus,
    getRateLimitSeconds,
    isRateLimitError,
    isServerError,
} from "utils/queryError";

const CONFLICT_STATUS = 409;

export const EMPTY_REGISTER_FORM: RegisterRequest = {
    name: "",
    surname: "",
    login: "",
    email: "",
    password: "",
};

export const hasEmptyRegisterField = (values: RegisterRequest): boolean =>
    Object.values(values).some((value) => value === "");

// t is bound to the "auth" namespace; a field that passes gets no key at all
export const registerFieldErrors = (
    values: RegisterRequest,
    t: TFunction,
): RegisterErrors => {
    const errors: RegisterErrors = {};

    if (!isValidNamePart(values.name)) {
        errors.name = t("errors.name");
    }
    if (!isValidNamePart(values.surname)) {
        errors.surname = t("errors.surname");
    }
    if (!isValidLogin(values.login)) {
        errors.login = t("errors.login");
    }
    if (!isValidEmail(values.email)) {
        errors.email = t("errors.email");
    }
    if (!isValidPassword(values.password)) {
        errors.password = t("errors.password");
    }

    return errors;
};

// the password is sent exactly as typed - a leading or trailing space may be part of it
export const trimmedRegistration = (
    values: RegisterRequest,
): RegisterRequest => ({
    ...values,
    name: values.name.trim(),
    surname: values.surname.trim(),
    login: values.login.trim(),
    email: values.email.trim(),
});

// the precise message for a failed registration, code first with a status fallback
export const registerErrorMessage = (error: unknown, t: TFunction): string => {
    const code = getQueryErrorCode(error);
    const isTakenLogin =
        code === ERROR_CODES.LOGIN_ALREADY_TAKEN ||
        getQueryErrorStatus(error) === CONFLICT_STATUS;

    if (code === ERROR_CODES.EMAIL_ALREADY_TAKEN) {
        return t("errors.emailAlreadyTaken");
    }
    if (isTakenLogin) {
        return t("errors.userExists");
    }
    if (isRateLimitError(error)) {
        return t("errors.tooManyRegisterAttempts", {
            seconds: getRateLimitSeconds(error),
        });
    }

    return isServerError(error)
        ? t("errors.serverError")
        : t("errors.registrationFailed");
};
