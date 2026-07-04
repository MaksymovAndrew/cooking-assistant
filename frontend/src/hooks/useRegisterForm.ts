import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "constants/routes";
import type { RegisterErrors, RegisterRequest } from "types/auth";

import { useRegisterMutation } from "redux/services/authApi";

import {
    isValidLogin,
    isValidNamePart,
    isValidPassword,
} from "utils/authValidation";

const EMPTY_FORM: RegisterRequest = {
    name: "",
    surname: "",
    login: "",
    password: "",
};

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

        const result = await registerUser(values);

        if ("data" in result) {
            void navigate(ROUTES.login);
        } else {
            setError(t("errors.userExists"));
        }
    }, [navigate, registerUser, t, validate, values]);

    return { values, errors, error, setField, handleSubmit };
};
