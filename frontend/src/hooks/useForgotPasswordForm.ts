import type { TFunction } from "i18next";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { useForgotPasswordMutation } from "redux/services/authApi";

import { isValidEmail } from "utils/authValidation";
import {
    getRateLimitSeconds,
    isRateLimitError,
    isServerError,
} from "utils/queryError";

function getForgotPasswordErrorMessage(error: unknown, t: TFunction): string {
    if (isRateLimitError(error)) {
        return t("errors.tooManyForgotPasswordAttempts", {
            seconds: getRateLimitSeconds(error),
        });
    }

    if (isServerError(error)) {
        return t("errors.serverError");
    }

    return t("errors.forgotPasswordFailed");
}

// always transitions to submitted on success - the backend gives the same generic response either way
export const useForgotPasswordForm = () => {
    const { t } = useTranslation("auth");
    const [forgotPassword] = useForgotPasswordMutation();

    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = useCallback(async () => {
        setError(null);

        if (!email) {
            setError(t("errors.allFieldsRequired"));

            return;
        }
        if (!isValidEmail(email)) {
            setError(t("errors.email"));

            return;
        }

        const result = await forgotPassword({ email: email.trim() });

        if ("data" in result) {
            setSubmitted(true);

            return;
        }

        setError(getForgotPasswordErrorMessage(result.error, t));
    }, [email, forgotPassword, t]);

    return { email, setEmail, error, submitted, handleSubmit };
};
