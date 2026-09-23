import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "constants/routes";
import type { RegisterErrors, RegisterRequest } from "types/auth";

import { useRegisterMutation } from "redux/services/authApi";

import { useAppRouter } from "hooks/useAppRouter";

import {
    EMPTY_REGISTER_FORM,
    hasEmptyRegisterField,
    registerErrorMessage,
    registerFieldErrors,
    trimmedRegistration,
} from "utils/registerForm";

export const useRegisterForm = () => {
    const { t } = useTranslation("auth");
    const router = useAppRouter();
    const [registerUser] = useRegisterMutation();

    const [values, setValues] = useState<RegisterRequest>(EMPTY_REGISTER_FORM);
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [error, setError] = useState<string | null>(null);

    const setField = useCallback(
        (field: keyof RegisterRequest, value: string) => {
            setValues((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        },
        [],
    );

    const handleSubmit = useCallback(async () => {
        setError(null);

        if (hasEmptyRegisterField(values)) {
            setErrors({});
            setError(t("errors.allFieldsRequired"));

            return;
        }

        // the next errors are used directly: the state set below would still be stale here
        const nextErrors = registerFieldErrors(values, t);

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        const result = await registerUser(trimmedRegistration(values));

        if ("data" in result) {
            router.push(ROUTES.home);

            return;
        }

        setError(registerErrorMessage(result.error, t));
    }, [router, registerUser, t, values]);

    return { values, errors, error, setField, handleSubmit };
};
