import type { TFunction } from "i18next";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ERROR_CODES } from "constants/errorCodes";
import { ROUTES } from "constants/routes";
import type { RegisterErrors, RegisterRequest } from "types/auth";

import { useRegisterMutation } from "redux/services/authApi";

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

const EMPTY_FORM: RegisterRequest = {
    name: "",
    surname: "",
    login: "",
    email: "",
    password: "",
};
const CONFLICT_STATUS = 409;

// maps a failed registration's query error to the precise user-facing message, code-first with a status-based fallback
function getRegisterErrorMessage(error: unknown, t: TFunction): string {
    const code = getQueryErrorCode(error);
    const status = getQueryErrorStatus(error);

    if (code === ERROR_CODES.EMAIL_ALREADY_TAKEN) {
        return t("errors.emailAlreadyTaken");
    }
    if (
        code === ERROR_CODES.LOGIN_ALREADY_TAKEN ||
        status === CONFLICT_STATUS
    ) {
        return t("errors.userExists");
    }
    if (isRateLimitError(error)) {
        return t("errors.tooManyRegisterAttempts", {
            seconds: getRateLimitSeconds(error),
        });
    }
    if (isServerError(error)) {
        return t("errors.serverError");
    }

    return t("errors.registrationFailed");
}

// validate() returns the next errors instead of relying on state, which would still be stale here
export const useRegisterForm = () => {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();
    const [registerUser] = useRegisterMutation();

    const [values, setValues] = useState<RegisterRequest>(EMPTY_FORM);
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [error, setError] = useState<string | null>(null);

    const setField = useCallback(
        (field: keyof RegisterRequest, value: string) => {
            setValues((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        },
        [],
    );

    const validate = useCallback((): RegisterErrors => {
        const nextErrors: RegisterErrors = {};

        if (!isValidNamePart(values.name)) {
            nextErrors.name = t("errors.name");
        }
        if (!isValidNamePart(values.surname)) {
            nextErrors.surname = t("errors.surname");
        }
        if (!isValidLogin(values.login)) {
            nextErrors.login = t("errors.login");
        }
        if (!isValidEmail(values.email)) {
            nextErrors.email = t("errors.email");
        }
        if (!isValidPassword(values.password)) {
            nextErrors.password = t("errors.password");
        }

        return nextErrors;
    }, [t, values]);

    const handleSubmit = useCallback(async () => {
        setError(null);

        const hasEmptyField =
            !values.name ||
            !values.surname ||
            !values.login ||
            !values.email ||
            !values.password;

        if (hasEmptyField) {
            setErrors({});
            setError(t("errors.allFieldsRequired"));

            return;
        }

        const nextErrors = validate();

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const result = await registerUser({
            ...values,
            name: values.name.trim(),
            surname: values.surname.trim(),
            login: values.login.trim(),
            email: values.email.trim(),
        });

        if ("data" in result) {
            void navigate(ROUTES.home);

            return;
        }

        setError(getRegisterErrorMessage(result.error, t));
    }, [navigate, registerUser, t, validate, values]);

    return { values, errors, error, setField, handleSubmit };
};
